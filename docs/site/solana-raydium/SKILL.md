# Solana DEX (AMM): Raydium Skill

## Execution model
- Build Raydium swap/liquidity instructions with protocol SDK.
- Submit signed tx via `solana.tx.sendRaw`.

## Required operational steps
1. Resolve pool address + token vaults.
2. Compute expected output and min-out guard.
3. Build swap/add/remove liquidity instruction set.
4. Simulate.
5. Broadcast.

## Safety
- Always enforce min-out / slippage bounds.
