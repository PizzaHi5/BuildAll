import { SkillException, type SkillResult } from '@chain-skills/core';
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

export const runSkillCommand = async (command: string, input: CommandInput): Promise<SkillResult> => {
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
