import { SkillException, withTiming } from '@chain-skills/core';

const OG_COMPUTE_BASE_URL = process.env.OG_COMPUTE_BASE_URL ?? 'https://inference.0g.ai';
const OG_API_KEY = process.env.OG_API_KEY;

const authHeaders = (): Record<string, string> => {
  if (!OG_API_KEY) return {};
  return { Authorization: `Bearer ${OG_API_KEY}` };
};

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${OG_COMPUTE_BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...authHeaders(),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new SkillException('RPC_ERROR', '0G inference request failed', {
      status: response.status,
      path,
      body: body.slice(0, 1200)
    });
  }

  return (await response.json()) as T;
};

export const ogModels = async () =>
  withTiming('0g', '0G Compute', true, async () => {
    const models = await fetchJson<Record<string, unknown>>('/v1/models');
    return { data: { models } };
  });

export const ogInference = async (input: {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  max_tokens?: number;
}) =>
  withTiming('0g', '0G Compute', false, async () => {
    const result = await fetchJson<Record<string, unknown>>('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.max_tokens
      })
    });
    return { data: { result } };
  });
