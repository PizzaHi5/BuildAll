import { SkillException, withTiming } from '@chain-skills/core';

const INJECTIVE_LCD_URL = process.env.INJECTIVE_LCD_URL ?? 'https://lcd.injective.network';

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${INJECTIVE_LCD_URL}${path}`, init);
  if (!response.ok) {
    const body = await response.text();
    throw new SkillException('RPC_ERROR', 'Injective request failed', { status: response.status, path, body: body.slice(0, 600) });
  }
  return (await response.json()) as T;
};

export const injectiveAccount = async (input: { address: string }) =>
  withTiming('injective', 'Injective', true, async () => {
    const account = await fetchJson<Record<string, unknown>>(`/cosmos/auth/v1beta1/accounts/${input.address}`);
    return { data: { account } };
  });

export const injectiveTokenBalance = async (input: { address: string; denom?: string }) =>
  withTiming<{ balance?: Record<string, unknown>; balances?: Record<string, unknown> }>('injective', 'Injective', true, async () => {
    if (input.denom) {
      const balance = await fetchJson<Record<string, unknown>>(`/cosmos/bank/v1beta1/balances/${input.address}/by_denom?denom=${encodeURIComponent(input.denom)}`);
      return { data: { balance } };
    }
    const balances = await fetchJson<Record<string, unknown>>(`/cosmos/bank/v1beta1/balances/${input.address}`);
    return { data: { balances } };
  });

export const injectiveSpotMarkets = async () =>
  withTiming('injective', 'Injective', true, async () => {
    const markets = await fetchJson<Record<string, unknown>>('/injective/exchange/v1beta1/spot/markets');
    return { data: { markets } };
  });

export const injectiveDerivativeMarkets = async () =>
  withTiming('injective', 'Injective', true, async () => {
    const markets = await fetchJson<Record<string, unknown>>('/injective/exchange/v1beta1/derivative/markets');
    return { data: { markets } };
  });

export const injectiveIbcDenomTrace = async (input: { hash: string }) =>
  withTiming('injective', 'Injective', true, async () => {
    const trace = await fetchJson<Record<string, unknown>>(`/ibc/apps/transfer/v1/denom_traces/${input.hash}`);
    return { data: { trace } };
  });

export const injectiveTxBroadcast = async (input: { txBytesBase64: string; mode?: 'BROADCAST_MODE_SYNC' | 'BROADCAST_MODE_ASYNC' | 'BROADCAST_MODE_BLOCK' }) =>
  withTiming('injective', 'Injective', false, async () => {
    const result = await fetchJson<Record<string, unknown>>('/cosmos/tx/v1beta1/txs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tx_bytes: input.txBytesBase64, mode: input.mode ?? 'BROADCAST_MODE_SYNC' })
    });
    return { data: { result } };
  });
