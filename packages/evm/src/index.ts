import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  getAddress,
  http,
  parseUnits,
  publicActions,
  type Abi,
  type Account,
  type PublicClient,
  type WalletClient,
  type Chain
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum, base, mainnet, optimism, polygon } from 'viem/chains';
import { loadConfig, SkillException, type AppConfig, type ChainConfig } from '@chain-skills/core';

export interface EvmContext {
  config: AppConfig;
  chain: ChainConfig;
  publicClient: PublicClient;
  walletClient?: WalletClient;
  account?: Account;
}

const VIEM_CHAIN_MAP: Record<number, Chain> = {
  1: mainnet,
  10: optimism,
  137: polygon,
  8453: base,
  42161: arbitrum
};

export const createEvmContext = (chainKey = 'ethereum'): EvmContext => {
  const config = loadConfig();
  const chain = config.chains[chainKey];
  if (!chain) throw new SkillException('UNSUPPORTED_CHAIN', `Unsupported chain: ${chainKey}`);

  const viemChain = VIEM_CHAIN_MAP[chain.chainId];
  if (!viemChain) throw new SkillException('UNSUPPORTED_CHAIN', `No viem chain mapping configured for chainId ${chain.chainId}`);

  const publicClient = createPublicClient({
    chain: viemChain,
    transport: http(chain.rpcUrl, { timeout: config.rpcTimeoutMs, retryCount: config.retryCount })
  });

  if (!config.privateKey) {
    return { config, chain, publicClient };
  }

  const account = privateKeyToAccount(config.privateKey);
  const walletClient = createWalletClient({ account, chain: viemChain, transport: http(chain.rpcUrl) }).extend(publicActions);
  return { config, chain, publicClient, walletClient, account };
};

export const parseAmount = (value: string, decimals: number): bigint => parseUnits(value, decimals);
export const formatAmount = (value: bigint, decimals: number): string => formatUnits(value, decimals);
export const normalizeAddress = (value: string): `0x${string}` => getAddress(value);

export const readContract = async <T>(ctx: EvmContext, params: { address: `0x${string}`; abi: Abi; functionName: string; args?: unknown[] }): Promise<T> => {
  try {
    return (await ctx.publicClient.readContract({
      address: params.address,
      abi: params.abi,
      functionName: params.functionName as never,
      args: params.args as never
    })) as T;
  } catch (error) {
    throw new SkillException('RPC_ERROR', 'EVM read contract failed', { error: (error as Error).message });
  }
};

export const sendContractTx = async (
  ctx: EvmContext,
  params: {
    address: `0x${string}`;
    abi: Abi;
    functionName: string;
    args?: unknown[];
    simulate?: boolean;
  }
): Promise<{ txHash?: `0x${string}`; simulated: boolean; blockNumber?: bigint }> => {
  if (!ctx.walletClient || !ctx.account) {
    throw new SkillException('INVALID_INPUT', 'Write requested but EVM_PRIVATE_KEY is not configured');
  }

  const simulation = await ctx.publicClient.simulateContract({
    address: params.address,
    abi: params.abi,
    functionName: params.functionName as never,
    args: params.args as never,
    account: ctx.account
  });

  if (simulation.request.gas && simulation.request.gas > ctx.config.maxGasLimit) {
    throw new SkillException('INVALID_INPUT', 'Estimated gas exceeds configured cap', {
      estimatedGas: simulation.request.gas.toString(),
      maxGasLimit: ctx.config.maxGasLimit.toString()
    });
  }

  if (params.simulate) {
    return { simulated: true };
  }

  const txHash = await ctx.walletClient.writeContract(simulation.request);
  const receipt = await ctx.publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120_000 });
  if (receipt.status !== 'success') throw new SkillException('TX_FAILED', 'Transaction reverted', { txHash });
  return { txHash, simulated: false, blockNumber: receipt.blockNumber };
};
