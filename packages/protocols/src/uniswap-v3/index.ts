import { SkillException, withTiming } from '@chain-skills/core';
import { createEvmContext, readContract, sendContractTx } from '@chain-skills/evm';

const V3_ADDRESSES = {
  ethereum: {
    quoterV2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' as const,
    swapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' as const
  },
  base: {
    quoterV2: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a' as const,
    swapRouter02: '0x2626664c2603336E57B271c5C0b26F421741e481' as const
  },
  arbitrum: {
    quoterV2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' as const,
    swapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' as const
  },
  optimism: {
    quoterV2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' as const,
    swapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' as const
  },
  polygon: {
    quoterV2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' as const,
    swapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' as const
  }
} as const;

const quoterV2Abi = [
  {
    type: 'function',
    name: 'quoteExactInputSingle',
    stateMutability: 'nonpayable',
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'fee', type: 'uint24' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'sqrtPriceX96After', type: 'uint160' },
      { name: 'initializedTicksCrossed', type: 'uint32' },
      { name: 'gasEstimate', type: 'uint256' }
    ]
  }
] as const;

const routerAbi = [
  {
    type: 'function',
    name: 'exactInputSingle',
    stateMutability: 'payable',
    inputs: [
      {
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ],
        name: 'params',
        type: 'tuple'
      }
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }]
  }
] as const;

const poolAbi = [
  {
    type: 'function',
    name: 'slot0',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' }
    ]
  },
  { type: 'function', name: 'liquidity', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint128' }] }
] as const;

export const v3Quote = async (input: {
  chain: string;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
  feeTier?: number;
}) => {
  const ctx = createEvmContext(input.chain);
  const addresses = V3_ADDRESSES[input.chain as keyof typeof V3_ADDRESSES];
  if (!addresses) throw new SkillException('UNSUPPORTED_CHAIN', `Uniswap v3 not configured for chain ${input.chain}`);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const out = await readContract<readonly [bigint, bigint, number, bigint]>(ctx, {
      address: addresses.quoterV2,
      abi: quoterV2Abi,
      functionName: 'quoteExactInputSingle',
      args: [
        {
          tokenIn: input.tokenIn,
          tokenOut: input.tokenOut,
          amountIn: input.amountIn,
          fee: input.feeTier ?? 3000,
          sqrtPriceLimitX96: 0n
        }
      ]
    });

    return { data: { amountOut: out[0], sqrtPriceX96After: out[1], initializedTicksCrossed: out[2], gasEstimate: out[3] } };
  });
};

export const v3SwapExactInputSingle = async (input: {
  chain: string;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: bigint;
  amountOutMinimum: bigint;
  recipient: `0x${string}`;
  feeTier?: number;
  simulate?: boolean;
}) => {
  const ctx = createEvmContext(input.chain);
  const addresses = V3_ADDRESSES[input.chain as keyof typeof V3_ADDRESSES];
  if (!addresses) throw new SkillException('UNSUPPORTED_CHAIN', `Uniswap v3 not configured for chain ${input.chain}`);
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: addresses.swapRouter02,
      abi: routerAbi,
      functionName: 'exactInputSingle',
      args: [
        {
          tokenIn: input.tokenIn,
          tokenOut: input.tokenOut,
          fee: input.feeTier ?? 3000,
          recipient: input.recipient,
          amountIn: input.amountIn,
          amountOutMinimum: input.amountOutMinimum,
          sqrtPriceLimitX96: 0n
        }
      ],
      simulate: input.simulate
    });
    return { data: { submitted: !input.simulate }, txHash: tx.txHash, blockNumber: tx.blockNumber };
  });
};

export const v3PoolState = async (input: { chain: string; pool: `0x${string}` }) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const [slot0, liquidity] = await Promise.all([
      readContract<readonly [bigint, number, number, number, number, number, boolean]>(ctx, {
        address: input.pool,
        abi: poolAbi,
        functionName: 'slot0'
      }),
      readContract<bigint>(ctx, { address: input.pool, abi: poolAbi, functionName: 'liquidity' })
    ]);
    return { data: { slot0, liquidity } };
  });
};
