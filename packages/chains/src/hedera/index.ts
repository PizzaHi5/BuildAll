import { SkillException, withTiming } from '@chain-skills/core';

const HEDERA_MIRROR_URL = process.env.HEDERA_MIRROR_URL ?? 'https://mainnet-public.mirrornode.hedera.com/api/v1';

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${HEDERA_MIRROR_URL}${path}`);
  if (!response.ok) {
    throw new SkillException('RPC_ERROR', 'Hedera mirror request failed', { status: response.status, path });
  }
  return (await response.json()) as T;
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
