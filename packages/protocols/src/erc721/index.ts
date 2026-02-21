import { withTiming } from '@chain-skills/core';
import { createEvmContext, readContract, sendContractTx } from '@chain-skills/evm';

const erc721Abi = [
  { type: 'function', name: 'ownerOf', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  {
    type: 'function',
    name: 'safeTransferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: []
  },
  { type: 'function', name: 'tokenURI', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'string' }] }
] as const;

export const nftOwnerOf = async (input: { chain: string; contract: `0x${string}`; tokenId: bigint }) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const owner = await readContract<`0x${string}`>(ctx, {
      address: input.contract,
      abi: erc721Abi,
      functionName: 'ownerOf',
      args: [input.tokenId]
    });
    return { data: { owner } };
  });
};

export const nftBalanceOf = async (input: { chain: string; contract: `0x${string}`; owner: `0x${string}` }) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const balance = await readContract<bigint>(ctx, {
      address: input.contract,
      abi: erc721Abi,
      functionName: 'balanceOf',
      args: [input.owner]
    });
    return { data: { balance } };
  });
};

export const nftTransfer = async (input: {
  chain: string;
  contract: `0x${string}`;
  tokenId: bigint;
  to: `0x${string}`;
  from?: `0x${string}`;
  simulate?: boolean;
}) => {
  const ctx = createEvmContext(input.chain);
  const from = input.from ?? (ctx.account?.address as `0x${string}` | undefined);
  if (!from) throw new Error('nft.transfer requires from address when no local signer is configured');
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: input.contract,
      abi: erc721Abi,
      functionName: 'safeTransferFrom',
      args: [from, input.to, input.tokenId],
      simulate: input.simulate,
      from
    });
    return { data: { transferred: true, browserRequest: tx.browserRequest }, txHash: tx.txHash, blockNumber: tx.blockNumber };
  });
};

export const nftTokenUri = async (input: { chain: string; contract: `0x${string}`; tokenId: bigint }) => {
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const tokenUri = await readContract<string>(ctx, {
      address: input.contract,
      abi: erc721Abi,
      functionName: 'tokenURI',
      args: [input.tokenId]
    });
    return { data: { tokenUri } };
  });
};
