import { SkillException, withTiming } from '@chain-skills/core';

const OPENSEA_BASE_URL = process.env.OPENSEA_BASE_URL ?? 'https://api.opensea.io/api/v2';

const getHeaders = (): Record<string, string> => {
  const apiKey = process.env.OPENSEA_API_KEY;
  return apiKey ? { 'X-API-KEY': apiKey } : {};
};

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${OPENSEA_BASE_URL}${path}`, { headers: getHeaders() });
  if (!response.ok) {
    const text = await response.text();
    throw new SkillException('RPC_ERROR', 'OpenSea request failed', {
      status: response.status,
      path,
      body: text.slice(0, 1000)
    });
  }
  return (await response.json()) as T;
};

export const openseaCollection = async (input: { slug: string }) => {
  return withTiming('ethereum', 'OpenSea', true, async () => {
    const data = await fetchJson<Record<string, unknown>>(`/collections/${input.slug}`);
    return { data };
  });
};

export const openseaFloor = async (input: { slug: string }) => {
  return withTiming('ethereum', 'OpenSea', true, async () => {
    const data = await fetchJson<Record<string, unknown>>(`/collections/${input.slug}/stats`);
    return { data };
  });
};

export const openseaListings = async (input: { slug: string; limit?: number }) => {
  return withTiming('ethereum', 'OpenSea', true, async () => {
    const limit = input.limit ?? 20;
    const data = await fetchJson<Record<string, unknown>>(`/listings/collection/${input.slug}/all?limit=${limit}`);
    return { data };
  });
};

export const openseaAsset = async (input: { contract: `0x${string}`; tokenId: string; chain?: string }) => {
  return withTiming('ethereum', 'OpenSea', true, async () => {
    const chain = input.chain ?? 'ethereum';
    const data = await fetchJson<Record<string, unknown>>(`/chain/${chain}/contract/${input.contract}/nfts/${input.tokenId}`);
    return { data };
  });
};
