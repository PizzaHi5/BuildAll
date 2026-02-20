# Lending Skill (Aave v3)

## Commands
- `lending.health`
- `lending.marketData`
- `lending.supply` (write)
- `lending.borrow` (write)
- `lending.repay` (write)
- `lending.withdraw` (write)

## Required input patterns
```json
{"chain":"optimism","account":"0x..."}
{"chain":"optimism","asset":"0x..."}
{"chain":"optimism","asset":"0x...","amount":"1000000","simulate":true}
{"chain":"optimism","asset":"0x...","amount":"500000","rateMode":2,"simulate":true}
```

## Notes
- Approve ERC-20 tokens before supply/repay.
- `rateMode=2` is common variable-rate mode.
