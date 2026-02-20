# Known Limitations & Roadmap

## Current limitations
- EVM chain map is seeded for Ethereum only (multi-EVM expansion is config work).
- Uniswap v4 write path intentionally disabled via `NOT_IMPLEMENTED_WRITE`.
- Maker basic mode uses simplified debt-unit handling for mint/repay operations; production-safe unit conversion helpers should be added before live capital use.
- OpenSea endpoints can evolve; adapter should be version-pinned and monitored.
- Non-EVM adapters are read-focused starter primitives (no signed write tx flow yet).

## Next roadmap steps
1. Add chain maps for Base/Arbitrum/Optimism/Polygon and protocol address registries per chain.
2. Harden Aave + Maker write paths with additional preflight checks and richer domain math.
3. Add OpenSea fallback endpoint mapping + pagination helpers.
4. Implement signed write flows for Solana/NEAR/Hedera.
5. Add CI workflow and e2e test profile against testnets/forks.
