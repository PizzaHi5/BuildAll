# Injective Skill

## Core capabilities
- Cosmos-native token balances (`injective.token.balance`)
- DEX orderbook markets (`injective.dex.spotMarkets`)
- Derivatives markets (`injective.dex.derivativeMarkets`)
- IBC denom tracing (`injective.ibc.denomTrace`)
- Signed tx broadcast (`injective.tx.broadcast`)

## Notes
- Injective uses Cosmos SDK transaction flow.
- Build/sign tx off-chain, then broadcast via `injective.tx.broadcast`.
- Use IBC denom traces when routing bridged assets.
