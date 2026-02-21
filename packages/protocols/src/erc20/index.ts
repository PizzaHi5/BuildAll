import { withTiming } from '@chain-skills/core';
import { createEvmContext, readContract, sendContractTx } from '@chain-skills/evm';

const erc20Abi = [
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  }
] as const;

export const tokenMetadata = async (input: { chain: string; token: `0x${string}` }) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const [name, symbol, decimals] = await Promise.all([
      readContract<string>(ctx, { address: input.token, abi: erc20Abi, functionName: 'name' }),
      readContract<string>(ctx, { address: input.token, abi: erc20Abi, functionName: 'symbol' }),
      readContract<number>(ctx, { address: input.token, abi: erc20Abi, functionName: 'decimals' })
    ]);
    return { data: { name, symbol, decimals } };
  });
};

export const tokenBalance = async (input: { chain: string; token: `0x${string}`; owner: `0x${string}` }) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const balance = await readContract<bigint>(ctx, {
      address: input.token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [input.owner]
    });
    return { data: { balance } };
  });
};

export const tokenAllowance = async (input: { chain: string; token: `0x${string}`; owner: `0x${string}`; spender: `0x${string}` }) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const allowance = await readContract<bigint>(ctx, {
      address: input.token,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [input.owner, input.spender]
    });
    return { data: { allowance } };
  });
};

export const tokenApprove = async (input: {
  chain: string;
  token: `0x${string}`;
  spender: `0x${string}`;
  amount: bigint;
  from?: `0x${string}`;
  simulate?: boolean;
}) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: input.token,
      abi: erc20Abi,
      functionName: 'approve',
      args: [input.spender, input.amount],
      simulate: input.simulate,
      from: input.from
    });
    return { data: { approved: true, browserRequest: tx.browserRequest }, txHash: tx.txHash, blockNumber: tx.blockNumber };
  });
};

export const tokenTransfer = async (input: {
  chain: string;
  token: `0x${string}`;
  to: `0x${string}`;
  amount: bigint;
  from?: `0x${string}`;
  simulate?: boolean;
}) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: input.token,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [input.to, input.amount],
      simulate: input.simulate,
      from: input.from
    });
    return { data: { transferred: true, browserRequest: tx.browserRequest }, txHash: tx.txHash, blockNumber: tx.blockNumber };
  });
};

export const usdcBalance = async (input: { chain: string; owner: `0x${string}` }) => {
  const ctx = createEvmContext(input.chain);
  if (!ctx.chain.usdc) throw new Error(`USDC address not configured for ${input.chain}`);
  return tokenBalance({ chain: input.chain, token: ctx.chain.usdc, owner: input.owner });
};
