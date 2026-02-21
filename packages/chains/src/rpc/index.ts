import { SkillException, withTiming } from '@chain-skills/core';

const CHAINLIST_URL = 'https://chainlist.org/rpcs.json';

const CHAIN_KEY_TO_ID: Record<string, number> = {
  ethereum: 1,
  optimism: 10,
  polygon: 137,
  arbitrum: 42161,
  base: 8453
};

type ChainlistEntry = {
  chainId: number;
  rpc?: string[];
};

const isLikelyActiveRpc = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('ws://') || url.startsWith('wss://')) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  return !url.includes('${');
};

export const rpcResolve = async (input: { chain: string; prefer?: 'env' | 'public' }) =>
  withTiming('multi', 'RpcResolver', true, async () => {
    const chainKey = input.chain;
    const chainId = CHAIN_KEY_TO_ID[chainKey];
    if (!chainId) throw new SkillException('UNSUPPORTED_CHAIN', `No Chainlist mapping configured for chain ${chainKey}`);

    const response = await fetch(CHAINLIST_URL);
    if (!response.ok) {
      throw new SkillException('RPC_ERROR', 'Failed to fetch Chainlist RPC catalog', { status: response.status });
    }

    const data = (await response.json()) as ChainlistEntry[];
    const match = data.find((c) => c.chainId === chainId);
    if (!match?.rpc?.length) {
      throw new SkillException('RPC_ERROR', `No RPC endpoints found in Chainlist for chain ${chainKey}`, { chainId });
    }

    const firstActive = match.rpc.find(isLikelyActiveRpc);
    if (!firstActive) {
      throw new SkillException('RPC_ERROR', `No active HTTP RPC endpoint found for chain ${chainKey}`, {
        chainId,
        rpcCount: match.rpc.length
      });
    }

    return {
      data: {
        chain: chainKey,
        chainId,
        source: 'chainlist',
        rpcUrl: firstActive,
        note: 'First active HTTP(S) endpoint from chainlist.org/rpcs.json'
      }
    };
  });
