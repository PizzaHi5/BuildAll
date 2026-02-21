import { SkillException, withTiming } from '@chain-skills/core';

const HEDERA_MIRROR_URL = process.env.HEDERA_MIRROR_URL ?? 'https://mainnet-public.mirrornode.hedera.com/api/v1';
const HEDERA_JSON_RPC_URL = process.env.HEDERA_JSON_RPC_URL ?? 'https://mainnet.hashio.io/api';

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${HEDERA_MIRROR_URL}${path}`);
  if (!response.ok) {
    throw new SkillException('RPC_ERROR', 'Hedera mirror request failed', { status: response.status, path });
  }
  return (await response.json()) as T;
};

const evmRpc = async <T>(method: string, params: unknown[]): Promise<T> => {
  const response = await fetch(HEDERA_JSON_RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  const json = (await response.json()) as { result?: T; error?: { code: number; message: string } };
  if (json.error) throw new SkillException('RPC_ERROR', `Hedera JSON-RPC error: ${json.error.message}`, { code: json.error.code });
  if (!json.result) throw new SkillException('RPC_ERROR', 'Hedera JSON-RPC empty result');
  return json.result;
};

export const hederaAccount = async (input: { accountId: string }) =>
  withTiming('hedera', 'Hedera', true, async () => {
    const account = await fetchJson<Record<string, unknown>>(`/accounts/${input.accountId}`);
    return { data: { account } };
  });

export const hederaToken = async (input: { tokenId: string }) =>
  withTiming('hedera', 'Hedera', true, async () => {
    const token = await fetchJson<Record<string, unknown>>(`/tokens/${input.tokenId}`);
    return { data: { token } };
  });

export const hederaHtsTokenInfo = async (input: { tokenId: string }) =>
  withTiming('hedera', 'Hedera', true, async () => {
    const token = await fetchJson<Record<string, unknown>>(`/tokens/${input.tokenId}`);
    return { data: { token } };
  });

export const hederaHcsTopicMessages = async (input: { topicId: string; limit?: number }) =>
  withTiming('hedera', 'Hedera', true, async () => {
    const limit = input.limit ?? 25;
    const messages = await fetchJson<Record<string, unknown>>(`/topics/${input.topicId}/messages?limit=${limit}`);
    return { data: { topicId: input.topicId, messages } };
  });

export const hederaUsdcInfo = async (input?: { usdcTokenId?: string }) =>
  withTiming('hedera', 'Hedera', true, async () => {
    const usdcTokenId = input?.usdcTokenId ?? '0.0.456858';
    const token = await fetchJson<Record<string, unknown>>(`/tokens/${usdcTokenId}`);
    return { data: { usdcTokenId, token } };
  });

export const hederaEvmCall = async (input: { to: `0x${string}`; data: `0x${string}`; from?: `0x${string}` }) =>
  withTiming('hedera', 'Hedera', true, async () => {
    const result = await evmRpc<string>('eth_call', [{ to: input.to, from: input.from, data: input.data }, 'latest']);
    return { data: { result } };
  });

export const hederaEvmSendRaw = async (input: { signedTxHex: `0x${string}` }) =>
  withTiming('hedera', 'Hedera', false, async () => {
    const txHash = await evmRpc<string>('eth_sendRawTransaction', [input.signedTxHex]);
    return { data: { txHash } };
  });
