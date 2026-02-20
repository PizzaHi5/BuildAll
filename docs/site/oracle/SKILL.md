# Oracle Skill (Chainlink)

## Commands
- `oracle.price` (explicit feed)
- `oracle.priceByPair` (configured pair map)

## Required input patterns
```json
{"chain":"polygon","base":"ETH","quote":"USD"}
{"chain":"base","feed":"0x..."}
```

## Notes
- Freshness checks are enforced.
- Use explicit feed mode when pair map is unavailable.
