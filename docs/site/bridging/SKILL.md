# Cross-Chain Swap + Bridging Skill

When user asks to move assets between chains, follow this exact order.

## A) Direct bridge route (preferred)

### Candidate bridges
- Wormhole
- Allbridge

### Compatible paths (practical)
- EVM ↔ EVM (Ethereum, Base, Arbitrum, Optimism, Polygon): usually direct via bridge protocols.
- EVM ↔ Solana: supported on some assets/routes via Wormhole/Allbridge depending on token and route availability.

### Steps
1. Identify source chain/token and destination chain/token.
2. Quote and verify route availability on supported bridges.
3. Approve token spending on source chain.
4. Bridge source asset to destination chain equivalent.
5. If needed, swap destination wrapped asset to target asset.
6. Confirm destination receipt.

## B) If no bridge route exists: CEX fallback (Coinbase Advanced Trade)

Ask user for Coinbase Advanced Trade API key with permissions:
- Trade
- View
- Transfer (withdrawals)

### CEX fallback sequence
1. Deposit source asset to user Coinbase deposit address.
2. Wait for required confirmations and balance availability.
3. Execute market conversion in order:
   - Sell source asset to USD quote (or supported liquid pair)
   - Buy target chain asset (example: SOL-USD)
4. Withdraw target asset to destination chain wallet address.
5. Confirm onchain receipt.

## Guardrails
- Always show fees and expected slippage before execution.
- Use test/small transfer first when bridging unfamiliar assets.
- Never proceed with CEX trades/withdrawals without explicit user confirmation.
- Before any bridge tx, validate target contract/account with:
  - `bridge.registry`
  - `bridge.validateAddress`
- Reject any user-supplied bridge target that fails validation as unverified.
