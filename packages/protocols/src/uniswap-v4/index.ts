import { SkillException, withTiming } from '@chain-skills/core';

export const UNISWAP_V4_CAPABILITIES = {
  quote: true,
  poolState: true,
  swapWrite: false,
  reason: 'Uniswap v4 write-path support is intentionally gated until stable SDK/router integration.'
} as const;

export const v4Quote = async (input: {
  chain: string;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
}) => {
  return withTiming(input.chain, 'Uniswap v4', true, async () => ({
    data: {
      supported: true,
      mode: 'scaffold',
      guidance: 'Hook into v4 SDK + Quoter as addresses/ABI stabilize per network.',
      requested: input
    }
  }));
};

export const v4PoolState = async (input: { chain: string; poolOrParams: Record<string, unknown> }) => {
  return withTiming(input.chain, 'Uniswap v4', true, async () => ({
    data: {
      supported: true,
      mode: 'scaffold',
      poolOrParams: input.poolOrParams
    }
  }));
};

export const v4Swap = async (input: { chain: string }) => {
  return withTiming(input.chain, 'Uniswap v4', false, async () => {
    throw new SkillException('NOT_IMPLEMENTED_WRITE', UNISWAP_V4_CAPABILITIES.reason, {
      capabilities: UNISWAP_V4_CAPABILITIES,
      guidance: 'Use protocol=v3 for executable swaps in this milestone.'
    });
  });
};
