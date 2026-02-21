import { SkillException, resolvePrimaryWallet, withTiming } from '@chain-skills/core';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
  type Commitment
} from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import bs58 from 'bs58';

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';
const DEFAULT_COMMITMENT: Commitment = 'confirmed';

const connection = () => new Connection(SOLANA_RPC_URL, DEFAULT_COMMITMENT);

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

const loadSigner = (): Keypair => {
  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) throw new SkillException('INVALID_INPUT', 'SOLANA_PRIVATE_KEY is required for Solana write operations');

  try {
    if (raw.trim().startsWith('[')) {
      const parsed = JSON.parse(raw) as number[];
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    }
    return Keypair.fromSecretKey(bs58.decode(raw));
  } catch (error) {
    throw new SkillException('INVALID_INPUT', 'Invalid SOLANA_PRIVATE_KEY format (expected base58 or JSON byte array)', {
      error: (error as Error).message
    });
  }
};

export const solanaBalance = async (input: { owner: string }) =>
  withTiming('solana', 'Solana', true, async () => {
    const pubkey = new PublicKey(input.owner);
    const result = await connection().getBalance(pubkey, DEFAULT_COMMITMENT);
    return { data: { lamports: result, sol: result / LAMPORTS_PER_SOL } };
  });

export const solanaTx = async (input: { signature: string }) =>
  withTiming('solana', 'Solana', true, async () => {
    const tx = await rpc<unknown>('getTransaction', [input.signature, { encoding: 'json' }]);
    return { data: { tx } };
  });

export const solanaSendRawTx = async (input: { signedTxBase64: string; simulate?: boolean; browserConfirmed?: boolean }) =>
  withTiming<{ simulated: boolean; signature: string | null; simulation: unknown }>('solana', 'Solana', input.simulate ?? false, async () => {
    const conn = connection();
    const txBytes = Buffer.from(input.signedTxBase64, 'base64');
    const deserialized = VersionedTransaction.deserialize(txBytes);

    if (input.simulate) {
      const sim = await conn.simulateTransaction(deserialized);
      return { data: { simulated: true, signature: null as string | null, simulation: sim.value } };
    }

    if (!input.browserConfirmed) {
      const wallet = resolvePrimaryWallet('solana');
      throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for Solana transaction broadcast', {
        chain: 'solana',
        wallet: wallet.wallet,
        browser: wallet.browser
      });
    }

    const signature = await conn.sendRawTransaction(txBytes, { skipPreflight: false, preflightCommitment: DEFAULT_COMMITMENT });
    const latest = await conn.getLatestBlockhash(DEFAULT_COMMITMENT);
    await conn.confirmTransaction({ signature, ...latest }, DEFAULT_COMMITMENT);
    return { data: { simulated: false, signature, simulation: {} } };
  });

export const solanaTransferSol = async (input: { to: string; lamports: number; simulate?: boolean; browserConfirmed?: boolean }) =>
  withTiming<{
    simulated: boolean;
    signature: string | null;
    simulation: unknown;
    from: string;
    to: string;
    lamports: number;
  }>('solana', 'Solana', input.simulate ?? false, async () => {
    const signer = loadSigner();
    const conn = connection();

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: signer.publicKey,
        toPubkey: new PublicKey(input.to),
        lamports: input.lamports
      })
    );

    if (input.simulate) {
      const sim = await conn.simulateTransaction(tx, [signer]);
      return {
        data: {
          simulated: true,
          signature: null as string | null,
          simulation: sim.value,
          from: signer.publicKey.toBase58(),
          to: input.to,
          lamports: input.lamports
        }
      };
    }

    if (!input.browserConfirmed) {
      const wallet = resolvePrimaryWallet('solana');
      throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for Solana transfers', {
        chain: 'solana',
        wallet: wallet.wallet,
        browser: wallet.browser,
        guidance: 'Prefer building/signing in Phantom and then submit via solana.tx.sendRaw with browserConfirmed=true.'
      });
    }

    const signature = await sendAndConfirmTransaction(conn, tx, [signer], { commitment: DEFAULT_COMMITMENT });
    return {
      data: {
        simulated: false,
        signature,
        simulation: {},
        from: signer.publicKey.toBase58(),
        to: input.to,
        lamports: input.lamports
      }
    };
  });

export const solanaSplBalance = async (input: { owner: string; mint: string }) =>
  withTiming('solana', 'Solana', true, async () => {
    const conn = connection();
    const owner = new PublicKey(input.owner);
    const mint = new PublicKey(input.mint);
    const ata = getAssociatedTokenAddressSync(mint, owner, true);
    const balance = await conn.getTokenAccountBalance(ata, DEFAULT_COMMITMENT);
    return { data: { owner: input.owner, mint: input.mint, ata: ata.toBase58(), balance } };
  });

export const solanaSplTransfer = async (input: { mint: string; toOwner: string; amountRaw: string; simulate?: boolean; browserConfirmed?: boolean }) =>
  withTiming<{
    simulated: boolean;
    signature: string | null;
    simulation: unknown;
    mint: string;
    fromAta: string;
    toAta: string;
    amountRaw: string;
  }>('solana', 'Solana', input.simulate ?? false, async () => {
    const signer = loadSigner();
    const conn = connection();

    const mint = new PublicKey(input.mint);
    const fromAta = getAssociatedTokenAddressSync(mint, signer.publicKey, true);
    const toOwner = new PublicKey(input.toOwner);
    const toAta = getAssociatedTokenAddressSync(mint, toOwner, true);

    const ix = createTransferInstruction(fromAta, toAta, signer.publicKey, BigInt(input.amountRaw));
    const tx = new Transaction().add(ix);

    if (input.simulate) {
      const sim = await conn.simulateTransaction(tx, [signer]);
      return {
        data: {
          simulated: true,
          signature: null as string | null,
          simulation: sim.value,
          mint: input.mint,
          fromAta: fromAta.toBase58(),
          toAta: toAta.toBase58(),
          amountRaw: input.amountRaw
        }
      };
    }

    if (!input.browserConfirmed) {
      const wallet = resolvePrimaryWallet('solana');
      throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for Solana SPL transfers', {
        chain: 'solana',
        wallet: wallet.wallet,
        browser: wallet.browser,
        guidance: 'Prefer browser wallet signing and then submit signed payload via solana.tx.sendRaw.'
      });
    }

    const signature = await sendAndConfirmTransaction(conn, tx, [signer], { commitment: DEFAULT_COMMITMENT });
    return {
      data: {
        simulated: false,
        signature,
        simulation: {},
        mint: input.mint,
        fromAta: fromAta.toBase58(),
        toAta: toAta.toBase58(),
        amountRaw: input.amountRaw
      }
    };
  });
