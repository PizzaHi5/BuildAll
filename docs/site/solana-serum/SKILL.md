# Solana DEX (Orderbook): Serum Skill

## Execution model
- Build Serum/OpenBook transaction using a protocol SDK or prebuilt instruction set.
- Submit through `solana.tx.sendRaw`.

## Required operational steps
1. Resolve market address + base/quote mints.
2. Ensure open orders account exists.
3. Create place-order / cancel / settle funds instructions.
4. Simulate transaction.
5. Broadcast with `solana.tx.sendRaw`.

## Notes
- Modern deployments often use OpenBook forks; verify active program/market addresses before execution.
