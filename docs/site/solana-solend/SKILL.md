# Solana Lending: Solend Skill

## Execution model
- Build Solend deposit/borrow/repay/withdraw instructions.
- Submit via `solana.tx.sendRaw`.

## Required operational steps
1. Resolve reserve + obligation accounts.
2. Check health factor / borrowing power.
3. Build action instruction set.
4. Simulate.
5. Broadcast.
