import { browserWalletConfirmationPlan, loadConfig, SkillException, resolvePrimaryWallet, type SkillResult } from '@chain-skills/core';
import {
  tokenAllowance,
  tokenApprove,
  tokenBalance,
  tokenTransfer,
  usdcBalance,
  nftBalanceOf,
  nftOwnerOf,
  nftTokenUri,
  nftTransfer,
  oraclePrice,
  oraclePriceByPair,
  v3PoolState,
  v3Quote,
  v3SwapExactInputSingle,
  v4PoolState,
  v4Quote,
  v4Swap,
  lendingBorrow,
  lendingHealth,
  lendingMarketData,
  lendingRepay,
  lendingSupply,
  lendingWithdraw,
  makerCollateralTypes,
  makerDaiDebt,
  makerMintDaiBasic,
  makerRepayDaiBasic,
  makerVaults,
  openseaAsset,
  openseaCollection,
  openseaFloor,
  openseaListings,
  bridgeRegistry,
  bridgeValidateAddress,
  bridgePreflight
} from '../../protocols/src/index.js';
import {
  hederaAccount,
  hederaToken,
  hederaHcsTopicMessages,
  hederaHtsTokenInfo,
  hederaUsdcInfo,
  hederaEvmCall,
  hederaEvmSendRaw,
  injectiveAccount,
  injectiveTokenBalance,
  injectiveSpotMarkets,
  injectiveDerivativeMarkets,
  injectiveIbcDenomTrace,
  injectiveTxBroadcast,
  ogModels,
  ogInference,
  rpcResolve,
  nearAccount,
  nearBalance,
  nearNep141Balance,
  nearRefPools,
  nearBurrowAccount,
  nearParasTokens,
  nearTxBroadcast,
  solanaBalance,
  solanaSplBalance,
  solanaSplTransfer,
  solanaTransferSol,
  solanaTx,
  solanaSendRawTx
} from '../../chains/src/index.js';

export type CommandInput = Record<string, unknown>;

const inferChainsFromInput = (input: CommandInput): string[] => {
  const chains = [
    input.chain,
    input.sourceChain,
    input.destinationChain,
    ...(Array.isArray(input.chains) ? input.chains : [])
  ]
    .filter((v): v is string => typeof v === 'string' && Boolean(v))
    .map((v) => v.toLowerCase());

  return Array.from(new Set(chains));
};

const buildConfirmationSteps = (route: ReturnType<typeof browserWalletConfirmationPlan>) =>
  route.confirmations.map((c, idx) => ({
    step: idx + 1,
    chain: c.chain,
    wallet: c.wallet,
    action: `Open ${c.wallet} in your ${c.browser} and confirm the transaction.`
  }));

const maybeApplyHeadlessSigner = (input: CommandInput): CommandInput => {
  const candidate = (input as { privateKey?: unknown }).privateKey;
  if (typeof candidate === 'string' && candidate.startsWith('0x') && candidate.length === 66) {
    process.env.EVM_PRIVATE_KEY = candidate;
    process.env.ENFORCE_BROWSER_CONFIRMATION = 'false';
    process.env.ALLOW_UNSAFE_LOCAL_SIGNING = 'true';
    const cloned = { ...input };
    delete (cloned as { privateKey?: string }).privateKey;
    return cloned;
  }
  return input;
};

export const runSkillCommand = async (command: string, input: CommandInput): Promise<SkillResult> => {
  input = maybeApplyHeadlessSigner(input);
  switch (command) {
    case 'token.balance':
      return tokenBalance(input as never);
    case 'token.allowance':
      return tokenAllowance(input as never);
    case 'token.approve':
      return tokenApprove(input as never);
    case 'token.transfer':
      return tokenTransfer(input as never);
    case 'usdc.balance':
      return usdcBalance(input as never);

    case 'wallet.resolve': {
      const chain = String((input as { chain?: string }).chain ?? '').toLowerCase();
      if (!chain) throw new SkillException('INVALID_INPUT', 'wallet.resolve requires chain');
      const wallet = resolvePrimaryWallet(chain);
      return {
        ok: true,
        data: { chain, ...wallet, confirmationRequired: true },
        meta: { chain, network: 'WalletRouting', simulated: true, latencyMs: 0 }
      };
    }

    case 'wallet.route': {
      const routeInput = input as { chain?: string; sourceChain?: string; destinationChain?: string; chains?: string[] };
      const chains = routeInput.chains?.length
        ? routeInput.chains
        : [routeInput.chain, routeInput.sourceChain, routeInput.destinationChain].filter((v): v is string => Boolean(v));
      if (!chains.length) throw new SkillException('INVALID_INPUT', 'wallet.route requires chain(s)');
      const plan = browserWalletConfirmationPlan(chains);
      return {
        ok: true,
        data: plan,
        meta: { chain: 'multi', network: 'WalletRouting', simulated: true, latencyMs: 0 }
      };
    }

    case 'wallet.evm.browserDispatch': {
      const evmInput = input as { chain?: string; browserRequest?: { method: string; params: unknown[] } };
      const chain = String(evmInput.chain ?? '').toLowerCase();
      if (!chain) throw new SkillException('INVALID_INPUT', 'wallet.evm.browserDispatch requires chain');
      if (!evmInput.browserRequest) throw new SkillException('INVALID_INPUT', 'wallet.evm.browserDispatch requires browserRequest');
      const cfg = loadConfig();
      const chainCfg = cfg.chains[chain];
      if (!chainCfg) throw new SkillException('UNSUPPORTED_CHAIN', `Unsupported chain: ${chain}`);
      const chainIdHex = `0x${chainCfg.chainId.toString(16)}`;
      const wallet = resolvePrimaryWallet(chain);
      const js = `const req = ${JSON.stringify(evmInput.browserRequest)};\nawait window.ethereum.request({ method: 'eth_requestAccounts' });\nawait window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '${chainIdHex}' }] });\nconst txHash = await window.ethereum.request(req);\nreturn { txHash };`;
      return {
        ok: true,
        data: { chain, wallet: wallet.wallet, chainIdHex, browserRequest: evmInput.browserRequest, browserEvalJavaScript: js },
        meta: { chain, network: 'WalletRouting', simulated: true, latencyMs: 0 }
      };
    }

    case 'wallet.evm.browserRelayDispatch': {
      const evmInput = input as { chain?: string; browserRequest?: { method: string; params: unknown[] } };
      const base = (await runSkillCommand('wallet.evm.browserDispatch', evmInput)) as SkillResult<Record<string, unknown>>;
      if (!base.ok || !base.data) return base;
      const data = base.data as {
        chain: string;
        wallet: string;
        chainIdHex: string;
        browserRequest: { method: string; params: unknown[] };
        browserEvalJavaScript: string;
      };
      return {
        ok: true,
        data: {
          ...data,
          relay: {
            profile: 'chrome',
            required: true,
            requiresAttachedTab: true,
            openclawAction: {
              action: 'act',
              request: {
                kind: 'evaluate',
                fn: `(async () => { ${data.browserEvalJavaScript} })()`
              }
            },
            guidance:
              'Use OpenClaw browser tool with profile=chrome on the attached tab, then execute act/evaluate with the provided function to trigger wallet confirmation popup.',
            friendlyIfUnavailable:
              'I can’t access your wallet tab yet. Please install/enable OpenClaw Browser Relay in Chrome/Brave, open the dApp tab, and click the relay toolbar icon until the badge shows ON. Then retry.'
          }
        },
        meta: { chain: data.chain, network: 'WalletRoutingRelay', simulated: true, latencyMs: 0 }
      };
    }

    case 'tx.executeWithBrowserConfirm': {
      const orchestrationInput = input as {
        command?: string;
        input?: CommandInput;
        operations?: Array<{ command: string; input: CommandInput }>;
        phase?: 'plan' | 'execute';
      };

      const operations = orchestrationInput.operations?.length
        ? orchestrationInput.operations
        : orchestrationInput.command && orchestrationInput.input
          ? [{ command: orchestrationInput.command, input: orchestrationInput.input }]
          : [];

      if (!operations.length) {
        throw new SkillException('INVALID_INPUT', 'tx.executeWithBrowserConfirm requires command+input or operations[]');
      }

      if (operations.some((op) => op.command === 'tx.executeWithBrowserConfirm')) {
        throw new SkillException('INVALID_INPUT', 'Nested tx.executeWithBrowserConfirm is not allowed');
      }

      const isExecutePhase = orchestrationInput.phase === 'execute';
      const runs: Array<{ command: string; result: SkillResult; preparedInput: CommandInput }> = [];
      const allChains = new Set<string>();

      for (const op of operations) {
        const preparedInput = isExecutePhase
          ? ({ ...op.input, simulate: false, browserConfirmed: true } as CommandInput)
          : ({ ...op.input, simulate: true } as CommandInput);
        const result = await runSkillCommand(op.command, preparedInput);
        inferChainsFromInput(op.input).forEach((c) => allChains.add(c));
        runs.push({ command: op.command, result, preparedInput });
      }

      const route = browserWalletConfirmationPlan(Array.from(allChains));
      const hasFailure = runs.some((s) => !s.result.ok);

      return {
        ok: !hasFailure,
        data: isExecutePhase
          ? {
              phase: hasFailure ? 'execution_failed' : 'execution_complete',
              walletRoute: route,
              executions: runs
            }
          : {
              phase: hasFailure ? 'simulation_failed' : 'awaiting_browser_confirmation',
              walletRoute: route,
              confirmationSteps: buildConfirmationSteps(route),
              simulations: runs,
              nextCall: {
                command: 'tx.executeWithBrowserConfirm',
                input: {
                  phase: 'execute',
                  operations: operations.map((op) => ({
                    command: op.command,
                    input: { ...op.input }
                  }))
                }
              }
            },
        error: hasFailure
          ? {
              code: 'INVALID_INPUT',
              message: isExecutePhase
                ? 'One or more transaction executions failed.'
                : 'One or more simulations failed. Resolve before requesting browser confirmation.'
            }
          : undefined,
        meta: {
          chain: route.chains.length > 1 ? 'multi' : (route.chains[0] ?? 'multi'),
          network: 'BrowserWalletOrchestrator',
          simulated: !isExecutePhase,
          latencyMs: 0
        }
      };
    }

    case 'nft.ownerOf':
      return nftOwnerOf(input as never);
    case 'nft.balanceOf':
      return nftBalanceOf(input as never);
    case 'nft.transfer':
      return nftTransfer(input as never);
    case 'nft.tokenUri':
      return nftTokenUri(input as never);

    case 'oracle.price':
      return oraclePrice(input as never);
    case 'oracle.priceByPair':
      return oraclePriceByPair(input as never);

    case 'dex.quote': {
      const dexInput = input as { protocol: string };
      return dexInput.protocol === 'v4' ? v4Quote(input as never) : v3Quote(input as never);
    }
    case 'dex.swap': {
      const dexInput = input as { protocol: string };
      return dexInput.protocol === 'v4' ? v4Swap(input as never) : v3SwapExactInputSingle(input as never);
    }
    case 'dex.poolState': {
      const dexInput = input as { protocol: string };
      return dexInput.protocol === 'v4' ? v4PoolState(input as never) : v3PoolState(input as never);
    }

    case 'lending.marketData':
      return lendingMarketData(input as never);
    case 'lending.health':
      return lendingHealth(input as never);
    case 'lending.supply':
      return lendingSupply(input as never);
    case 'lending.borrow':
      return lendingBorrow(input as never);
    case 'lending.repay':
      return lendingRepay(input as never);
    case 'lending.withdraw':
      return lendingWithdraw(input as never);

    case 'maker.vaults':
      return makerVaults(input as never);
    case 'maker.collateralTypes':
      return makerCollateralTypes(input as never);
    case 'maker.daiDebt':
      return makerDaiDebt(input as never);
    case 'maker.mintDaiBasic':
      return makerMintDaiBasic(input as never);
    case 'maker.repayDaiBasic':
      return makerRepayDaiBasic(input as never);

    case 'opensea.collection':
      return openseaCollection(input as never);
    case 'opensea.floor':
      return openseaFloor(input as never);
    case 'opensea.listings':
      return openseaListings(input as never);
    case 'opensea.asset':
      return openseaAsset(input as never);

    case 'bridge.registry':
      return bridgeRegistry(input as never);
    case 'bridge.validateAddress':
      return bridgeValidateAddress(input as never);
    case 'bridge.preflight':
      return bridgePreflight(input as never);

    case 'solana.balance':
      return solanaBalance(input as never);
    case 'solana.tx':
      return solanaTx(input as never);
    case 'solana.tx.sendRaw':
      return solanaSendRawTx(input as never);
    case 'solana.transfer':
      return solanaTransferSol(input as never);
    case 'solana.spl.balance':
      return solanaSplBalance(input as never);
    case 'solana.spl.transfer':
      return solanaSplTransfer(input as never);
    case 'near.account':
      return nearAccount(input as never);
    case 'near.balance':
      return nearBalance(input as never);
    case 'near.nep141.balance':
      return nearNep141Balance(input as never);
    case 'near.ref.pools':
      return nearRefPools(input as never);
    case 'near.burrow.account':
      return nearBurrowAccount(input as never);
    case 'near.paras.tokens':
      return nearParasTokens(input as never);
    case 'near.tx.broadcast':
      return nearTxBroadcast(input as never);

    case 'hedera.account':
      return hederaAccount(input as never);
    case 'hedera.token':
      return hederaToken(input as never);
    case 'hedera.hts.tokenInfo':
      return hederaHtsTokenInfo(input as never);
    case 'hedera.hcs.messages':
      return hederaHcsTopicMessages(input as never);
    case 'hedera.usdc.info':
      return hederaUsdcInfo(input as never);
    case 'hedera.evm.call':
      return hederaEvmCall(input as never);
    case 'hedera.evm.sendRaw':
      return hederaEvmSendRaw(input as never);

    case 'injective.account':
      return injectiveAccount(input as never);
    case 'injective.token.balance':
      return injectiveTokenBalance(input as never);
    case 'injective.dex.spotMarkets':
      return injectiveSpotMarkets();
    case 'injective.dex.derivativeMarkets':
      return injectiveDerivativeMarkets();
    case 'injective.ibc.denomTrace':
      return injectiveIbcDenomTrace(input as never);
    case 'injective.tx.broadcast':
      return injectiveTxBroadcast(input as never);

    case 'og.models':
      return ogModels();
    case 'og.inference':
      return ogInference(input as never);

    case 'rpc.resolve':
      return rpcResolve(input as never);

    default:
      throw new SkillException('INVALID_INPUT', `Unknown command: ${command}`);
  }
};
