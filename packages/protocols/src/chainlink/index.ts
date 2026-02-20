import { SkillException, withTiming } from '@chain-skills/core';
import { createEvmContext, readContract } from '@chain-skills/evm';

const chainlinkFeedAbi = [
  {
    type: 'function',
    name: 'latestRoundData',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' }
    ]
  },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'description', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] }
] as const;

const PAIR_FEED_MAP: Record<string, Record<string, `0x${string}`>> = {
  ethereum: {
    'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c'
  },
  arbitrum: {
    'ETH/USD': '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
    'BTC/USD': '0x6ce185860a4963106506C203335A2910413708e9'
  },
  optimism: {
    'ETH/USD': '0x13e3Ee699D1909E989722E753853AE30b17e08c5',
    'BTC/USD': '0xD702dd976fb76fffc2D3963D037dfdae5b04E593'
  },
  polygon: {
    'ETH/USD': '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    'BTC/USD': '0xc907E116054Ad103354f2D350FD2514433D57F6f'
  }
};

export const assertFreshness = (updatedAtSec: bigint, nowSec: number, maxStalenessSec: number): void => {
  const age = nowSec - Number(updatedAtSec);
  if (age > maxStalenessSec) {
    throw new SkillException('STALE_ORACLE_DATA', 'Chainlink feed is stale', {
      updatedAtSec: updatedAtSec.toString(),
      ageSec: age,
      maxStalenessSec
    });
  }
};

export const oraclePrice = async (input: { chain: string; feed: `0x${string}` }) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const [roundData, decimals, description] = await Promise.all([
      readContract<readonly [bigint, bigint, bigint, bigint, bigint]>(ctx, {
        address: input.feed,
        abi: chainlinkFeedAbi,
        functionName: 'latestRoundData'
      }),
      readContract<number>(ctx, { address: input.feed, abi: chainlinkFeedAbi, functionName: 'decimals' }),
      readContract<string>(ctx, { address: input.feed, abi: chainlinkFeedAbi, functionName: 'description' })
    ]);

    const updatedAt = roundData[3];
    assertFreshness(updatedAt, Math.floor(Date.now() / 1000), ctx.config.oracleMaxStalenessSec);

    return {
      data: {
        feed: input.feed,
        description,
        answer: roundData[1],
        updatedAt,
        decimals
      }
    };
  });
};

export const oraclePriceByPair = async (input: { chain: string; base: string; quote: string }) => {
  const pair = `${input.base.toUpperCase()}/${input.quote.toUpperCase()}`;
  const chainMap = PAIR_FEED_MAP[input.chain];
  const feed = chainMap?.[pair];
  if (!feed) {
    throw new SkillException('INVALID_INPUT', `No Chainlink feed configured for pair ${pair} on ${input.chain}`);
  }
  return oraclePrice({ chain: input.chain, feed });
};
