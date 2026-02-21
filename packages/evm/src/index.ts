import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  getAddress,
  http,
  numberToHex,
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
import { loadConfig, resolvePrimaryWallet, SkillException, type AppConfig, type ChainConfig } from '@chain-skills/core';

export interface EvmContext {
  config: AppConfig;
  chainKey: string;
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
    return { config, chainKey, chain, publicClient };
  }

  const account = privateKeyToAccount(config.privateKey);
  const walletClient = createWalletClient({ account, chain: viemChain, transport: http(chain.rpcUrl) }).extend(publicActions);
  return { config, chainKey, chain, publicClient, walletClient, account };
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

const toHexQuantity = (value: bigint | number | undefined): string | undefined => {
  if (value === undefined) return undefined;
  return numberToHex(typeof value === 'number' ? BigInt(value) : value);
};

const buildBrowserRequest = (request: {
  from?: `0x${string}`;
  to?: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
  gas?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}): { method: 'eth_sendTransaction'; params: Record<string, string>[] } => {
  const tx: Record<string, string> = {};
  if (request.from) tx.from = request.from;
  if (request.to) tx.to = request.to;
  if (request.data) tx.data = request.data;
  const value = toHexQuantity(request.value);
  const gas = toHexQuantity(request.gas);
  const maxFeePerGas = toHexQuantity(request.maxFeePerGas);
  const maxPriorityFeePerGas = toHexQuantity(request.maxPriorityFeePerGas);
  if (value) tx.value = value;
  if (gas) tx.gas = gas;
  if (maxFeePerGas) tx.maxFeePerGas = maxFeePerGas;
  if (maxPriorityFeePerGas) tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
  return { method: 'eth_sendTransaction', params: [tx] };
};

export const sendContractTx = async (
  ctx: EvmContext,
  params: {
    address: `0x${string}`;
    abi: Abi;
    functionName: string;
    args?: unknown[];
    simulate?: boolean;
    from?: `0x${string}`;
  }
): Promise<{
  txHash?: `0x${string}`;
  simulated: boolean;
  blockNumber?: bigint;
  browserRequest?: { method: 'eth_sendTransaction'; params: Record<string, string>[] };
}> => {
  const simulationAccount = (params.from ?? ctx.account?.address) as `0x${string}` | undefined;
  if (!simulationAccount) {
    throw new SkillException('INVALID_INPUT', 'EVM write simulation requires from address (wallet account)');
  }

  const simulation = await ctx.publicClient.simulateContract({
    address: params.address,
    abi: params.abi,
    functionName: params.functionName as never,
    args: params.args as never,
    account: simulationAccount
  });

  if (simulation.request.gas && simulation.request.gas > ctx.config.maxGasLimit) {
    throw new SkillException('INVALID_INPUT', 'Estimated gas exceeds configured cap', {
      estimatedGas: simulation.request.gas.toString(),
      maxGasLimit: ctx.config.maxGasLimit.toString()
    });
  }

  const browserRequest = buildBrowserRequest(simulation.request);

  if (params.simulate) {
    return { simulated: true, browserRequest };
  }

  if (ctx.config.enforceBrowserConfirmation && !ctx.config.allowUnsafeLocalSigning) {
    const wallet = resolvePrimaryWallet(ctx.chainKey);
    throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for EVM writes', {
      chain: ctx.chainKey,
      wallet: wallet.wallet,
      browser: wallet.browser,
      browserRequest,
      guidance:
        'Submit this via the browser-injected provider (window.ethereum.request). Do not sign with local private keys when browser confirmation is enforced.',
      relayHelp:
        'If no browser tab is connected, install/enable OpenClaw Browser Relay in Chrome/Brave and click the relay toolbar icon on the target tab (badge ON), then retry.'
    });
  }

  if (!ctx.walletClient || !ctx.account) {
    throw new SkillException('INVALID_INPUT', 'Local signing path requested but EVM_PRIVATE_KEY is not configured');
  }

  const txHash = await ctx.walletClient.writeContract(simulation.request);
  const receipt = await ctx.publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120_000 });
  if (receipt.status !== 'success') throw new SkillException('TX_FAILED', 'Transaction reverted', { txHash });
  return { txHash, simulated: false, blockNumber: receipt.blockNumber };
};
