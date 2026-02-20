import { SkillException, withTiming } from '@chain-skills/core';
import { createEvmContext, readContract, sendContractTx } from '@chain-skills/evm';

const AAVE_ADDRESSES = {
  ethereum: {
    addressesProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e' as const
  },
  base: {
    addressesProvider: '0xe20fCbDbfF2bE4D83cB6E8dA5a0f60f0D6Ee2f44' as const
  },
  arbitrum: {
    addressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb' as const
  },
  optimism: {
    addressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb' as const
  },
  polygon: {
    addressesProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb' as const
  }
} as const;

const addressesProviderAbi = [
  { type: 'function', name: 'getPool', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'getPoolDataProvider', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] }
] as const;

const poolAbi = [
  {
    type: 'function',
    name: 'getUserAccountData',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' }
    ]
  },
  {
    type: 'function',
    name: 'supply',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'borrow',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'interestRateMode', type: 'uint256' },
      { name: 'referralCode', type: 'uint16' },
      { name: 'onBehalfOf', type: 'address' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'repay',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'interestRateMode', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'to', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }]
  }
] as const;

const dataProviderAbi = [
  {
    type: 'function',
    name: 'getReserveData',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      { type: 'uint256' },
      { type: 'uint128' },
      { type: 'uint128' },
      { type: 'uint128' },
      { type: 'uint128' },
      { type: 'uint128' },
      { type: 'uint40' },
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'uint8' }
    ]
  }
] as const;

const chainAddresses = (chain: string) => AAVE_ADDRESSES[chain as keyof typeof AAVE_ADDRESSES];

const resolveMarketAddresses = async (chain: string) => {
  const chainCfg = chainAddresses(chain);
  if (!chainCfg) throw new SkillException('UNSUPPORTED_CHAIN', `Aave v3 not configured for chain ${chain}`);
  const ctx = createEvmContext(chain);
  const [pool, dataProvider] = await Promise.all([
    readContract<`0x${string}`>(ctx, {
      address: chainCfg.addressesProvider,
      abi: addressesProviderAbi,
      functionName: 'getPool'
    }),
    readContract<`0x${string}`>(ctx, {
      address: chainCfg.addressesProvider,
      abi: addressesProviderAbi,
      functionName: 'getPoolDataProvider'
    })
  ]);
  return { ctx, pool, dataProvider };
};

export const lendingHealth = async (input: { chain: string; account: `0x${string}` }) => {
  const { ctx, pool } = await resolveMarketAddresses(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const data = await readContract<readonly [bigint, bigint, bigint, bigint, bigint, bigint]>(ctx, {
      address: pool,
      abi: poolAbi,
      functionName: 'getUserAccountData',
      args: [input.account]
    });

    return {
      data: {
        totalCollateralBase: data[0],
        totalDebtBase: data[1],
        availableBorrowsBase: data[2],
        currentLiquidationThreshold: data[3],
        ltv: data[4],
        healthFactor: data[5]
      }
    };
  });
};

export const lendingMarketData = async (input: { chain: string; asset: `0x${string}` }) => {
  const { ctx, dataProvider } = await resolveMarketAddresses(input.chain);
  return withTiming(input.chain, ctx.chain.name, true, async () => {
    const reserveData = await readContract<readonly unknown[]>(ctx, {
      address: dataProvider,
      abi: dataProviderAbi,
      functionName: 'getReserveData',
      args: [input.asset]
    });

    return { data: { reserveData } };
  });
};

export const lendingSupply = async (input: {
  chain: string;
  asset: `0x${string}`;
  amount: bigint;
  onBehalfOf?: `0x${string}`;
  simulate?: boolean;
}) => {
  const { ctx, pool } = await resolveMarketAddresses(input.chain);
  const onBehalfOf = input.onBehalfOf ?? ctx.account?.address;
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: pool,
      abi: poolAbi,
      functionName: 'supply',
      args: [input.asset, input.amount, onBehalfOf, 0],
      simulate: input.simulate
    });
    return { data: { supplied: true }, txHash: tx.txHash, blockNumber: tx.blockNumber };
  });
};

export const lendingBorrow = async (input: {
  chain: string;
  asset: `0x${string}`;
  amount: bigint;
  rateMode: number;
  onBehalfOf?: `0x${string}`;
  simulate?: boolean;
}) => {
  const { ctx, pool } = await resolveMarketAddresses(input.chain);
  const onBehalfOf = input.onBehalfOf ?? ctx.account?.address;
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: pool,
      abi: poolAbi,
      functionName: 'borrow',
      args: [input.asset, input.amount, input.rateMode, 0, onBehalfOf],
      simulate: input.simulate
    });
    return { data: { borrowed: true }, txHash: tx.txHash, blockNumber: tx.blockNumber };
  });
};

export const lendingRepay = async (input: {
  chain: string;
  asset: `0x${string}`;
  amount: bigint;
  rateMode: number;
  onBehalfOf?: `0x${string}`;
  simulate?: boolean;
}) => {
  const { ctx, pool } = await resolveMarketAddresses(input.chain);
  const onBehalfOf = input.onBehalfOf ?? ctx.account?.address;
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: pool,
      abi: poolAbi,
      functionName: 'repay',
      args: [input.asset, input.amount, input.rateMode, onBehalfOf],
      simulate: input.simulate
    });
    return { data: { repaid: true }, txHash: tx.txHash, blockNumber: tx.blockNumber };
  });
};

export const lendingWithdraw = async (input: {
  chain: string;
  asset: `0x${string}`;
  amount: bigint;
  to?: `0x${string}`;
  simulate?: boolean;
}) => {
  const { ctx, pool } = await resolveMarketAddresses(input.chain);
  const to = input.to ?? ctx.account?.address;
  return withTiming(input.chain, ctx.chain.name, input.simulate ?? false, async () => {
    const tx = await sendContractTx(ctx, {
      address: pool,
      abi: poolAbi,
      functionName: 'withdraw',
      args: [input.asset, input.amount, to],
      simulate: input.simulate
    });
    return { data: { withdrawn: true }, txHash: tx.txHash, blockNumber: tx.blockNumber };
  });
};
