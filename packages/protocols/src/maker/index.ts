import { SkillException, withTiming } from '@chain-skills/core';
import { createEvmContext, readContract, sendContractTx } from '@chain-skills/evm';

const MAKER = {
  ethereum: {
    cdpManager: '0x5ef30b9986345249bc32d8928B7ee64DE9435E39' as const
  }
} as const;

const cdpManagerAbi = [
  {
    type: 'function',
    name: 'first',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'list',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ type: 'uint256' }, { type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'urns',
    stateMutability: 'view',
    inputs: [{ name: 'cdp', type: 'uint256' }],
    outputs: [{ type: 'address' }]
  },
  {
    type: 'function',
    name: 'ilks',
    stateMutability: 'view',
    inputs: [{ name: 'cdp', type: 'uint256' }],
    outputs: [{ type: 'bytes32' }]
  },
  {
    type: 'function',
    name: 'owns',
    stateMutability: 'view',
    inputs: [{ name: 'cdp', type: 'uint256' }],
    outputs: [{ type: 'address' }]
  },
  {
    type: 'function',
    name: 'frob',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'cdp', type: 'uint256' },
      { name: 'dink', type: 'int256' },
      { name: 'dart', type: 'int256' }
    ],
    outputs: []
  }
] as const;

export const makerVaults = async (input: { chain: string; owner: `0x${string}` }) => {
  const ctx = createEvmContext(input.chain);
  const addresses = MAKER[input.chain as keyof typeof MAKER];

  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const vaults: Array<{ vaultId: bigint; urn: `0x${string}`; ilk: `0x${string}` }> = [];
    let current = await readContract<bigint>(ctx, {
      address: addresses.cdpManager,
      abi: cdpManagerAbi,
      functionName: 'first',
      args: [input.owner]
    });

    for (let i = 0; i < 20 && current > 0n; i += 1) {
      const [next] = await readContract<readonly [bigint, bigint]>(ctx, {
        address: addresses.cdpManager,
        abi: cdpManagerAbi,
        functionName: 'list',
        args: [current]
      });
      const [urn, ilk] = await Promise.all([
        readContract<`0x${string}`>(ctx, {
          address: addresses.cdpManager,
          abi: cdpManagerAbi,
          functionName: 'urns',
          args: [current]
        }),
        readContract<`0x${string}`>(ctx, {
          address: addresses.cdpManager,
          abi: cdpManagerAbi,
          functionName: 'ilks',
          args: [current]
        })
      ]);
      vaults.push({ vaultId: current, urn, ilk });
      current = next;
    }

    return { data: { owner: input.owner, vaults } };
  });
};

export const makerDaiDebt = async (input: { chain: string; vaultId: bigint }) => {
  const ctx = createEvmContext(input.chain);
  const addresses = MAKER[input.chain as keyof typeof MAKER];
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const [urn, ilk, owner] = await Promise.all([
      readContract<`0x${string}`>(ctx, { address: addresses.cdpManager, abi: cdpManagerAbi, functionName: 'urns', args: [input.vaultId] }),
      readContract<`0x${string}`>(ctx, { address: addresses.cdpManager, abi: cdpManagerAbi, functionName: 'ilks', args: [input.vaultId] }),
      readContract<`0x${string}`>(ctx, { address: addresses.cdpManager, abi: cdpManagerAbi, functionName: 'owns', args: [input.vaultId] })
    ]);
    return { data: { vaultId: input.vaultId, owner, urn, ilk, note: 'Detailed debt math requires Vat/Jug integration; use as base read primitive.' } };
  });
};

const ensureMainnet = (chain: string): void => {
  if (chain !== 'ethereum') throw new SkillException('UNSUPPORTED_CHAIN', 'Maker basic operations are mainnet-only in this release');
};

export const makerMintDaiBasic = async (input: { chain: string; vaultId: bigint; amount: bigint; simulate?: boolean }) => {
  ensureMainnet(input.chain);
  const ctx = createEvmContext(input.chain);
  const addresses = MAKER[input.chain as keyof typeof MAKER];
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: addresses.cdpManager,
      abi: cdpManagerAbi,
      functionName: 'frob',
      args: [input.vaultId, 0n, BigInt(input.amount)],
      simulate: input.simulate
    });

    return {
      data: {
        submitted: !input.simulate,
        caveat: 'Maker debt unit conversions are simplified in this basic mode; validate production math with Vat/Jug before live use.'
      },
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    };
  });
};

export const makerRepayDaiBasic = async (input: { chain: string; vaultId: bigint; amount: bigint; simulate?: boolean }) => {
  ensureMainnet(input.chain);
  const ctx = createEvmContext(input.chain);
  const addresses = MAKER[input.chain as keyof typeof MAKER];
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: addresses.cdpManager,
      abi: cdpManagerAbi,
      functionName: 'frob',
      args: [input.vaultId, 0n, -BigInt(input.amount)],
      simulate: input.simulate
    });

    return {
      data: {
        submitted: !input.simulate,
        caveat: 'Maker debt unit conversions are simplified in this basic mode; validate production math with Vat/Jug before live use.'
      },
      txHash: tx.txHash,
      blockNumber: tx.blockNumber
    };
  });
};

export const makerCollateralTypes = async (input: { chain: string }) => {
  ensureMainnet(input.chain);
  const ctx = createEvmContext(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => ({
    data: {
      supported: ['ETH-A', 'ETH-B', 'ETH-C', 'WBTC-A', 'WSTETH-A'],
      note: 'Static starter list; for exhaustive coverage wire Maker chainlog parser in next revision.'
    }
  }));
};
