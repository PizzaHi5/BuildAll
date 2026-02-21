import { describe, expect, it } from 'vitest';
import { runSkillCommand } from '../packages/skills/src/index.js';

describe('skills dispatcher', () => {
  it('returns NOT_IMPLEMENTED_WRITE for v4 swap', async () => {
    const result = await runSkillCommand('dex.swap', { protocol: 'v4', chain: 'ethereum' });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe('NOT_IMPLEMENTED_WRITE');
  });

  it('resolves primary wallet by chain', async () => {
    const result = await runSkillCommand('wallet.resolve', { chain: 'solana' });
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ wallet: 'Phantom', confirmationRequired: true });
  });

  it('builds multi-chain wallet route requiring multiple confirmations', async () => {
    const result = await runSkillCommand('wallet.route', { sourceChain: 'base', destinationChain: 'solana' });
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ totalConfirmations: 2, multiWalletFlow: true });
  });

  it('orchestrates simulate-then-confirm flow', async () => {
    const planned = await runSkillCommand('tx.executeWithBrowserConfirm', {
      operations: [{ command: 'dex.swap', input: { protocol: 'v4', chain: 'ethereum' } }]
    });
    expect(planned.ok).toBe(false);
    expect(planned.data).toMatchObject({ phase: 'simulation_failed' });
    expect((planned.data as Record<string, unknown>).nextCall).toBeDefined();
  });

  it('builds browser-dispatch payload for EVM provider', async () => {
    const result = await runSkillCommand('wallet.evm.browserDispatch', {
      chain: 'base',
      browserRequest: { method: 'eth_sendTransaction', params: [{ to: '0x0000000000000000000000000000000000000000' }] }
    });
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ wallet: 'MetaMask', chainIdHex: '0x2105' });
  });

  it('builds browser-relay dispatch payload for attached chrome tab', async () => {
    const result = await runSkillCommand('wallet.evm.browserRelayDispatch', {
      chain: 'ethereum',
      browserRequest: { method: 'eth_sendTransaction', params: [{ to: '0x0000000000000000000000000000000000000000' }] }
    });
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({ relay: { profile: 'chrome', required: true } });
  });

  it('accepts test privateKey override for headless signer mode', async () => {
    const pk = `0x${'1'.repeat(64)}`;
    const result = await runSkillCommand('wallet.resolve', { chain: 'base', privateKey: pk });
    expect(result.ok).toBe(true);
    expect(process.env.EVM_PRIVATE_KEY).toBe(pk);
    expect(process.env.ENFORCE_BROWSER_CONFIRMATION).toBe('false');
  });
});
