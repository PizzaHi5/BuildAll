# Protocol Coverage Matrix

| Area | Command(s) | Status |
|---|---|---|
| Core runtime | config, tx simulate/send, normalized results | ✅ Implemented |
| ERC-20 | token.balance/allowance/approve/transfer, usdc.balance | ✅ Multi-chain (eth/base/arb/op/poly) |
| ERC-721 | nft.ownerOf/balanceOf/transfer/tokenUri | ✅ Multi-chain (eth/base/arb/op/poly) |
| Chainlink | oracle.price/oracle.priceByPair + staleness check | ✅ Multi-chain (eth/arb/op/poly + explicit-feed mode for any chain) |
| Uniswap v3 | dex.quote/dex.swap/dex.poolState | ✅ Multi-chain (eth/base/arb/op/poly) |
| Uniswap v4 | dex.quote/dex.poolState scaffold, dex.swap gated | ✅ Capability-gated |
| Aave v3 | lending.marketData/health/supply/borrow/repay/withdraw | ✅ Multi-chain (eth/base/arb/op/poly) |
| Maker | maker.vaults/collateralTypes/daiDebt/mintDaiBasic/repayDaiBasic | ⚠️ Ethereum-only (stablecoin module baseline) |
| OpenSea | opensea.collection/floor/listings/asset | ✅ Read-only implemented (cross-chain asset lookup) |
| Solana core | solana.balance/solana.tx/solana.transfer/solana.spl.balance/solana.spl.transfer/solana.tx.sendRaw | ✅ Mainnet send/receive + raw protocol tx broadcast |
| Solana DEX (orderbook) | serum/openbook via solana.tx.sendRaw | ✅ Execution pattern enabled (signed tx broadcast) |
| Solana DEX (AMM) | raydium via solana.tx.sendRaw | ✅ Execution pattern enabled (signed tx broadcast) |
| Solana lending | solend via solana.tx.sendRaw | ✅ Execution pattern enabled (signed tx broadcast) |
| Solana derivatives | mango via solana.tx.sendRaw | ✅ Execution pattern enabled (signed tx broadcast) |
| Solana oracle | pyth via RPC account reads | ✅ Read pattern documented |
| Solana NFT marketplace | magiceden via API + solana.tx.sendRaw | ✅ Execution pattern documented |
| Injective | injective.account/token.balance/dex.spotMarkets/dex.derivativeMarkets/ibc.denomTrace/tx.broadcast | ✅ Added (mainnet read + signed tx broadcast) |
| NEAR | near.account/near.balance/nep141.balance/ref.pools/burrow.account/paras.tokens/tx.broadcast | ✅ Expanded adapter |
| Hedera | hedera.account/token/hts.tokenInfo/hcs.messages/usdc.info/evm.call/evm.sendRaw | ✅ Expanded adapter |
| 0G AI | og.models/og.inference | ✅ Added decentralized inference adapter |
