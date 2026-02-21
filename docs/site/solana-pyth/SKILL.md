# Solana Oracle: Pyth Skill

## Recommended approach
- Read Pyth price accounts via Solana RPC account fetch.
- Validate confidence interval + publish time freshness.

## Execution model
- Oracle reads are read-only.
- If consuming in protocol tx flow, include freshness checks before signing.
