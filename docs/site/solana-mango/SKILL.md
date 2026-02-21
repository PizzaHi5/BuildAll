# Solana Derivatives: Mango Markets Skill

## Execution model
- Build Mango account + perp/spot instructions through Mango client.
- Submit via `solana.tx.sendRaw`.

## Required operational steps
1. Resolve group + market addresses.
2. Validate margin and liquidation constraints.
3. Build order/place/cancel/settle flow.
4. Simulate.
5. Broadcast.
