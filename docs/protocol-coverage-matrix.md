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
| Solana | solana.balance/solana.tx | ✅ Starter adapter |
| NEAR | near.account/near.balance | ✅ Starter adapter |
| Hedera | hedera.account/hedera.token | ✅ Starter adapter |
