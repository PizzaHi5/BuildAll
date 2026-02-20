# Stablecoin Skill (Maker Baseline)

## Scope
Maker module is currently executable on **Ethereum mainnet** in this release.

## Commands
- `maker.vaults`
- `maker.collateralTypes`
- `maker.daiDebt`
- `maker.mintDaiBasic` (write)
- `maker.repayDaiBasic` (write)

## Required input patterns
```json
{"chain":"ethereum","owner":"0x..."}
{"chain":"ethereum","vaultId":"1234","amount":"1000000000000000000","simulate":true}
```

## Notes
- Basic mode is intentionally conservative.
- Production-grade debt math should use full Vat/Jug flows.
