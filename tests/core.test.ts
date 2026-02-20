import { describe, expect, it } from 'vitest';
import { SkillException, withTiming } from '../packages/core/src/index.js';
import { assertFreshness } from '../packages/protocols/src/chainlink/index.js';

describe('core timing/result contract', () => {
  it('returns ok result with meta', async () => {
    const result = await withTiming('ethereum', 'Ethereum', true, async () => ({ data: { x: 1 } }));
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ x: 1 });
    expect(result.meta.chain).toBe('ethereum');
    expect(typeof result.meta.latencyMs).toBe('number');
  });

  it('maps exceptions into deterministic errors', async () => {
    const result = await withTiming('ethereum', 'Ethereum', true, async () => {
      throw new SkillException('INVALID_INPUT', 'bad input');
    });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('INVALID_INPUT');
  });
});

describe('chainlink freshness guard', () => {
  it('allows fresh data', () => {
    const now = Math.floor(Date.now() / 1000);
    expect(() => assertFreshness(BigInt(now - 10), now, 60)).not.toThrow();
  });

  it('throws on stale data', () => {
    expect(() => assertFreshness(1n, 1000, 100)).toThrowError(/stale/i);
  });
});
