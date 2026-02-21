# Verified Bridge Registry (Mainnet)

Machine-readable bridge target registry used for runtime validation.

## Files
- `mainnet/ethereum.json`
- `mainnet/base.json`
- `mainnet/arbitrum.json`
- `mainnet/optimism.json`
- `mainnet/polygon.json`
- `mainnet/solana.json`
- `mainnet/injective.json`
- `mainnet/near.json`
- `mainnet/hedera.json`

## Validation commands
- `bridge.registry` → returns registry entries (single chain or all)
- `bridge.validateAddress` → hard-fails if address does not match verified registry entry
- `bridge.preflight` → deterministic route strategy + action plan (direct bridge vs Coinbase fallback)

### Example
```bash
chain-skills -c bridge.validateAddress -i '{"protocol":"wormhole","chain":"base","contractType":"tokenBridge","address":"0x8d2de8d2f73F1F4cAB472AC9A881C9b123C79627"}'
```

## Sources
Primary source used for Wormhole addresses:
- https://wormhole.com/docs/products/reference/contract-addresses/

Additional source for Allbridge Classic Solana accounts:
- https://raw.githubusercontent.com/allbridge-io/allbridge-contract-docs/master/README.md

> Re-verify addresses against sources before any production migration.
