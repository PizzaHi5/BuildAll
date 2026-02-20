import { SkillException, withTiming } from '@chain-skills/core';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

const rpc = async <T>(method: string, params: unknown[]): Promise<T> => {
  const response = await fetch(SOLANA_RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  const json = (await response.json()) as { result?: T; error?: { message: string; code: number } };
  if (json.error) throw new SkillException('RPC_ERROR', `Solana RPC error: ${json.error.message}`, { code: json.error.code });
  if (!json.result) throw new SkillException('RPC_ERROR', 'Solana RPC returned empty result');
  return json.result;
};

export const solanaBalance = async (input: { owner: string }) =>
  withTiming('solana', 'Solana', true, async () => {
    const result = await rpc<{ value: number }>('getBalance', [input.owner]);
    return { data: { lamports: result.value } };
  });

export const solanaTx = async (input: { signature: string }) =>
  withTiming('solana', 'Solana', true, async () => {
    const tx = await rpc<unknown>('getTransaction', [input.signature, { encoding: 'json' }]);
    return { data: { tx } };
  });
