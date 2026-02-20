import { SkillException, withTiming } from '@chain-skills/core';

const NEAR_RPC_URL = process.env.NEAR_RPC_URL ?? 'https://rpc.mainnet.near.org';

const rpc = async <T>(method: string, params: Record<string, unknown>): Promise<T> => {
  const response = await fetch(NEAR_RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 'chain-skills', method, params })
  });
  const json = (await response.json()) as { result?: T; error?: { message: string; code: number } };
  if (json.error) throw new SkillException('RPC_ERROR', `NEAR RPC error: ${json.error.message}`, { code: json.error.code });
  if (!json.result) throw new SkillException('RPC_ERROR', 'NEAR RPC returned empty result');
  return json.result;
};

export const nearAccount = async (input: { accountId: string }) =>
  withTiming('near', 'NEAR', true, async () => {
    const account = await rpc<Record<string, unknown>>('query', {
      request_type: 'view_account',
      finality: 'final',
      account_id: input.accountId
    });
    return { data: { account } };
  });

export const nearBalance = async (input: { accountId: string }) =>
  withTiming('near', 'NEAR', true, async () => {
    const account = await rpc<{ amount: string; locked: string }>('query', {
      request_type: 'view_account',
      finality: 'final',
      account_id: input.accountId
    });
    return { data: { amount: account.amount, locked: account.locked } };
  });
