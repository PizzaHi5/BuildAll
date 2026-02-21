import { SkillException, resolvePrimaryWallet, withTiming } from '@chain-skills/core';
import algosdk from 'algosdk';

const ALGORAND_ALGOD_URL = process.env.ALGORAND_ALGOD_URL ?? 'https://mainnet-api.algonode.cloud';
const ALGORAND_INDEXER_URL = process.env.ALGORAND_INDEXER_URL ?? 'https://mainnet-idx.algonode.cloud';
const ALGORAND_ALGOD_TOKEN = process.env.ALGORAND_ALGOD_TOKEN ?? '';

const algodClient = () =>
  new algosdk.Algodv2(ALGORAND_ALGOD_TOKEN, ALGORAND_ALGOD_URL, '');

const indexerClient = () =>
  new algosdk.Indexer(ALGORAND_ALGOD_TOKEN, ALGORAND_INDEXER_URL, '');

const loadSigner = (): algosdk.Account => {
  const raw = process.env.ALGORAND_MNEMONIC;
  if (!raw) throw new SkillException('INVALID_INPUT', 'ALGORAND_MNEMONIC is required for Algorand write operations');

  try {
    return algosdk.mnemonicToSecretKey(raw.trim());
  } catch (error) {
    throw new SkillException('INVALID_INPUT', 'Invalid ALGORAND_MNEMONIC format (25-word BIP-39 mnemonic required)', {
      error: (error as Error).message
    });
  }
};

// ── Reads ──────────────────────────────────────────────────────────────────

export const algoBalance = async (input: { address: string }) =>
  withTiming('algorand', 'Algorand', true, async () => {
    const info = await algodClient().accountInformation(input.address).do();
    const microAlgos = Number(info.amount);
    const minBalance = Number(info.minBalance);
    return {
      data: {
        address: input.address,
        microAlgos,
        algos: microAlgos / 1e6,
        minBalanceMicroAlgos: minBalance,
        assets: (info.assets ?? []) as unknown[]
      }
    };
  });

export const algoAssetBalance = async (input: { address: string; assetId: number }) =>
  withTiming('algorand', 'Algorand', true, async () => {
    const info = await algodClient().accountAssetInformation(input.address, input.assetId).do();
    const assetInfo = await algodClient().getAssetByID(input.assetId).do();
    const decimals = assetInfo.params.decimals as number;
    if (!info.assetHolding) throw new SkillException('INVALID_INPUT', `Address ${input.address} has not opted into asset ${input.assetId}`);
    const rawAmount = Number(info.assetHolding.amount);
    return {
      data: {
        address: input.address,
        assetId: input.assetId,
        name: assetInfo.params.name as string,
        unitName: assetInfo.params.unitName as string,
        rawAmount,
        amount: rawAmount / Math.pow(10, decimals),
        decimals,
        optedIn: true
      }
    };
  });

export const algoTx = async (input: { txId: string }) =>
  withTiming('algorand', 'Algorand', true, async () => {
    const tx = await indexerClient().lookupTransactionByID(input.txId).do();
    return { data: { tx } };
  });

export const algoAssetInfo = async (input: { assetId: number }) =>
  withTiming('algorand', 'Algorand', true, async () => {
    const asset = await algodClient().getAssetByID(input.assetId).do();
    return { data: { assetId: input.assetId, asset } };
  });

export const algoAppInfo = async (input: { appId: number }) =>
  withTiming('algorand', 'Algorand', true, async () => {
    const app = await algodClient().getApplicationByID(input.appId).do();
    return { data: { appId: input.appId, app } };
  });

// ── Writes ─────────────────────────────────────────────────────────────────

export const algoTransfer = async (input: {
  to: string;
  microAlgos: number;
  note?: string;
  simulate?: boolean;
  browserConfirmed?: boolean;
}) =>
  withTiming<{
    simulated: boolean;
    txId: string | null;
    from: string;
    to: string;
    microAlgos: number;
    simulation: unknown;
  }>('algorand', 'Algorand', input.simulate ?? false, async () => {
    const signer = loadSigner();
    const client = algodClient();
    const suggestedParams = await client.getTransactionParams().do();
    const noteBytes = input.note ? new TextEncoder().encode(input.note) : undefined;

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: signer.addr,
      receiver: input.to,
      amount: input.microAlgos,
      note: noteBytes,
      suggestedParams
    });

    if (input.simulate) {
      const stxn = txn.signTxn(signer.sk);
      const simReq = new algosdk.modelsv2.SimulateRequest({
        txnGroups: [new algosdk.modelsv2.SimulateRequestTransactionGroup({ txns: [algosdk.decodeSignedTransaction(stxn)] })]
      });
      const simResult = await client.simulateTransactions(simReq).do();
      return {
        data: {
          simulated: true,
          txId: null as string | null,
          from: signer.addr.toString(),
          to: input.to,
          microAlgos: input.microAlgos,
          simulation: simResult
        }
      };
    }

    if (!input.browserConfirmed) {
      const wallet = resolvePrimaryWallet('algorand');
      throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for Algorand transfers', {
        chain: 'algorand',
        wallet: wallet.wallet,
        browser: wallet.browser,
        guidance: 'Use Pera Wallet or Defly to sign and submit via algorand.tx.sendRaw with browserConfirmed=true.'
      });
    }

    const stxn = txn.signTxn(signer.sk);
    const { txid } = await client.sendRawTransaction(stxn).do();
    await algosdk.waitForConfirmation(client, txid, 4);
    return {
      data: {
        simulated: false,
        txId: txid,
        from: signer.addr.toString(),
        to: input.to,
        microAlgos: input.microAlgos,
        simulation: {}
      }
    };
  });

export const algoAssetTransfer = async (input: {
  assetId: number;
  to: string;
  amount: number;
  simulate?: boolean;
  browserConfirmed?: boolean;
}) =>
  withTiming<{
    simulated: boolean;
    txId: string | null;
    from: string;
    to: string;
    assetId: number;
    amount: number;
    simulation: unknown;
  }>('algorand', 'Algorand', input.simulate ?? false, async () => {
    const signer = loadSigner();
    const client = algodClient();
    const suggestedParams = await client.getTransactionParams().do();

    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: signer.addr,
      receiver: input.to,
      assetIndex: input.assetId,
      amount: input.amount,
      suggestedParams
    });

    if (input.simulate) {
      const stxn = txn.signTxn(signer.sk);
      const simReq = new algosdk.modelsv2.SimulateRequest({
        txnGroups: [new algosdk.modelsv2.SimulateRequestTransactionGroup({ txns: [algosdk.decodeSignedTransaction(stxn)] })]
      });
      const simResult = await client.simulateTransactions(simReq).do();
      return {
        data: {
          simulated: true,
          txId: null as string | null,
          from: signer.addr.toString(),
          to: input.to,
          assetId: input.assetId,
          amount: input.amount,
          simulation: simResult
        }
      };
    }

    if (!input.browserConfirmed) {
      const wallet = resolvePrimaryWallet('algorand');
      throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for Algorand ASA transfers', {
        chain: 'algorand',
        wallet: wallet.wallet,
        browser: wallet.browser,
        guidance: 'Use Pera Wallet or Defly to sign and submit via algorand.tx.sendRaw with browserConfirmed=true.'
      });
    }

    const stxn = txn.signTxn(signer.sk);
    const { txid } = await client.sendRawTransaction(stxn).do();
    await algosdk.waitForConfirmation(client, txid, 4);
    return {
      data: {
        simulated: false,
        txId: txid,
        from: signer.addr.toString(),
        to: input.to,
        assetId: input.assetId,
        amount: input.amount,
        simulation: {}
      }
    };
  });

export const algoOptIn = async (input: {
  assetId: number;
  simulate?: boolean;
  browserConfirmed?: boolean;
}) =>
  withTiming<{
    simulated: boolean;
    txId: string | null;
    address: string;
    assetId: number;
    simulation: unknown;
  }>('algorand', 'Algorand', input.simulate ?? false, async () => {
    const signer = loadSigner();
    const client = algodClient();
    const suggestedParams = await client.getTransactionParams().do();

    // Opt-in is a 0-amount self-transfer of the ASA
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: signer.addr,
      receiver: signer.addr,
      assetIndex: input.assetId,
      amount: 0,
      suggestedParams
    });

    if (input.simulate) {
      const stxn = txn.signTxn(signer.sk);
      const simReq = new algosdk.modelsv2.SimulateRequest({
        txnGroups: [new algosdk.modelsv2.SimulateRequestTransactionGroup({ txns: [algosdk.decodeSignedTransaction(stxn)] })]
      });
      const simResult = await client.simulateTransactions(simReq).do();
      return {
        data: {
          simulated: true,
          txId: null as string | null,
          address: signer.addr.toString(),
          assetId: input.assetId,
          simulation: simResult
        }
      };
    }

    if (!input.browserConfirmed) {
      const wallet = resolvePrimaryWallet('algorand');
      throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for Algorand ASA opt-in', {
        chain: 'algorand',
        wallet: wallet.wallet,
        browser: wallet.browser
      });
    }

    const stxn = txn.signTxn(signer.sk);
    const { txid } = await client.sendRawTransaction(stxn).do();
    await algosdk.waitForConfirmation(client, txid, 4);
    return {
      data: {
        simulated: false,
        txId: txid,
        address: signer.addr.toString(),
        assetId: input.assetId,
        simulation: {}
      }
    };
  });

export const algoSendRaw = async (input: { signedTxBase64: string; simulate?: boolean; browserConfirmed?: boolean }) =>
  withTiming<{
    simulated: boolean;
    txId: string | null;
    simulation: unknown;
  }>('algorand', 'Algorand', input.simulate ?? false, async () => {
    const client = algodClient();
    const txBytes = Buffer.from(input.signedTxBase64, 'base64');

    if (input.simulate) {
      const decoded = algosdk.decodeSignedTransaction(txBytes);
      const simReq = new algosdk.modelsv2.SimulateRequest({
        txnGroups: [new algosdk.modelsv2.SimulateRequestTransactionGroup({ txns: [decoded] })]
      });
      const simResult = await client.simulateTransactions(simReq).do();
      return { data: { simulated: true, txId: null as string | null, simulation: simResult } };
    }

    if (!input.browserConfirmed) {
      const wallet = resolvePrimaryWallet('algorand');
      throw new SkillException('INVALID_INPUT', 'Browser wallet confirmation required for Algorand transaction broadcast', {
        chain: 'algorand',
        wallet: wallet.wallet,
        browser: wallet.browser
      });
    }

    const { txid } = await client.sendRawTransaction(txBytes).do();
    await algosdk.waitForConfirmation(client, txid, 4);
    return { data: { simulated: false, txId: txid, simulation: {} } };
  });
