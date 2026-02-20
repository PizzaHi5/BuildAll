# NFT Marketplace Skill (OpenSea Read)

## Commands
- `opensea.collection`
- `opensea.floor`
- `opensea.listings`
- `opensea.asset`

## Required input patterns
```json
{"slug":"doodles-official"}
{"chain":"base","contract":"0x...","tokenId":"1"}
```

## Notes
- Read-only metadata and market data.
- Do not treat API data as canonical onchain state.
