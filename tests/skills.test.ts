import { describe, expect, it } from 'vitest';
import { runSkillCommand } from '../packages/skills/src/index.js';

describe('skills dispatcher', () => {
  it('returns NOT_IMPLEMENTED_WRITE for v4 swap', async () => {
    const result = await runSkillCommand('dex.swap', { protocol: 'v4', chain: 'ethereum' });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('NOT_IMPLEMENTED_WRITE');
  });
});
