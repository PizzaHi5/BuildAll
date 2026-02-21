import { SkillException, resolvePrimaryWallet, withTiming } from '@chain-skills/core';

const NEAR_RPC_URL = process.env.NEAR_RPC_URL ?? 'https://rpc.mainnet.near.org';

const rpc = async <T>(method: string, params: unknown): Promise<T> => {
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

const decodeNearResult = (result: unknown): unknown => {
  const raw = (result as { result?: number[] })?.result;
  if (!raw) return result;
  const text = Buffer.from(raw).toString('utf8');
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
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

export const nearNep141Balance = async (input: { accountId: string; tokenContract: string }) =>
  withTiming('near', 'NEAR', true, async () => {
    const args = Buffer.from(JSON.stringify({ account_id: input.accountId })).toString('base64');
    const result = await rpc<Record<string, unknown>>('query', {
      request_type: 'call_function',
      finality: 'final',
      account_id: input.tokenContract,
      method_name: 'ft_balance_of',
      args_base64: args
    });
    return { data: { tokenContract: input.tokenContract, accountId: input.accountId, balance: decodeNearResult(result) } };
  });

export const nearRefPools = async (input: { refContract?: string }) =>
  withTiming('near', 'NEAR', true, async () => {
    const refContract = input.refContract ?? 'v2.ref-finance.near';
    const args = Buffer.from(JSON.stringify({ from_index: 0, limit: 20 })).toString('base64');
    const result = await rpc<Record<string, unknown>>('query', {
      request_type: 'call_function',
      finality: 'final',
      account_id: refContract,
      method_name: 'get_pools',
      args_base64: args
    });
    return { data: { refContract, pools: decodeNearResult(result) } };
  });

export const nearBurrowAccount = async (input: { accountId: string; burrowContract?: string }) =>
  withTiming('near', 'NEAR', true, async () => {
    const burrowContract = input.burrowContract ?? 'contract.main.burrow.near';
    const args = Buffer.from(JSON.stringify({ account_id: input.accountId })).toString('base64');
    const result = await rpc<Record<string, unknown>>('query', {
      request_type: 'call_function',
      finality: 'final',
      account_id: burrowContract,
      method_name: 'get_account',
      args_base64: args
    });
    return { data: { burrowContract, accountId: input.accountId, account: decodeNearResult(result) } };
  });

export const nearParasTokens = async (input: { ownerId: string; parasContract?: string }) =>
  withTiming('near', 'NEAR', true, async () => {
    const parasContract = input.parasContract ?? 'x.paras.near';
    const args = Buffer.from(JSON.stringify({ account_id: input.ownerId, from_index: '0', limit: 20 })).toString('base64');
    const result = await rpc<Record<string, unknown>>('query', {
      request_type: 'call_function',
      finality: 'final',
      account_id: parasContract,
      method_name: 'nft_tokens_for_owner',
      args_base64: args
    });
    return { data: { parasContract, ownerId: input.ownerId, tokens: decodeNearResult(result) } };
  });

export const nearTxBroadcast = async (input: { signedTxBase64: string; browserConfirmed?: boolean }) =>
  withTiming('near', 'NEAR', false, async () => {
    if (!input.browserConfirmed) {
      const wallet = resolvePrimaryWallet('near');
      throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for NEAR transaction broadcast', {
        chain: 'near',
        wallet: wallet.wallet,
        browser: wallet.browser
      });
    }
    const result = await rpc<Record<string, unknown>>('broadcast_tx_commit', [input.signedTxBase64]);
    return { data: { result } };
  });
