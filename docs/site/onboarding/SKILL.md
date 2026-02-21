# Onboarding Skill (First-Time Agent)

This is the first file an agent should use before any execution.

## Rule: first response must collect required user data
When a user references BuildAll docs, the agent's **first response** should be a data-intake request, not an execution attempt.

Use this checklist and ask only missing items.

## Required intake data (minimum)
1. **Task intent**
   - Example: "swap USDC to ETH on Ethereum"
2. **Source chain / destination chain**
   - e.g. `ethereum` -> `ethereum` (same-chain swap) or cross-chain route
3. **RPC preference**
   - user-supplied RPC URL(s) OR public RPC auto-selection
   - if public RPC is chosen, resolve via `https://chainlist.org/rpcs.json` and select first active HTTP(S) endpoint per required chain (`rpc.resolve`)
4. **Asset details**
   - source token symbol + contract/mint/denom
   - destination token symbol + contract/mint/denom
   - amount + units
5. **Wallet addresses**
   - source wallet
   - destination wallet (if different)
6. **Execution mode**
   - simulation only OR execute live
7. **Slippage / risk settings**
   - max slippage %
   - max fees (if user has limits)
8. **Approval policy**
   - approve exact amount or unlimited approval

## Conditionally required data
### For EVM writes
- Wallet signing enabled in runtime (private key or external signer)
- Gas token availability (ETH/MATIC/etc.)
- If using Uniswap API-backed skills: `UNISWAP_API_KEY` configured in environment
- Key creation portal: https://developers.uniswap.org/dashboard

### For Solana writes
- `SOLANA_PRIVATE_KEY` configured (base58 or JSON array)
- SOL for fees

### For Injective / Cosmos routes
- Signed tx bytes workflow available
- IBC destination route info if bridging

### For NEAR
- Signed tx bytes workflow available

### For Hedera EVM writes
- Signed raw transaction hex

### For 0G inference calls
- `OG_COMPUTE_BASE_URL` configured
- `OG_API_KEY` configured if endpoint requires authentication
- Selected target model id (`og.models`)

### For Coinbase fallback routes
- Coinbase Advanced Trade API key
- Required scopes: **Trade, View, Transfer**
- Explicit user confirmation to use CEX fallback

## Mandatory first-response template
Use this exact structure in first reply:

1. Confirm intent in one sentence.
2. Ask for missing required fields from checklist.
3. State that execution starts with simulation/preflight.

Example:
"Got it — you want to swap USDC to ETH on Ethereum. Before I execute, send:
- your source wallet address
- USDC amount
- max slippage %
- simulation-only or live execution
- approval preference (exact or unlimited)
- RPC preference: provide your own Ethereum RPC URL, or say 'use public RPC' and I’ll resolve the first active endpoint from chainlist.org
Then I’ll run quote + simulation and return the plan before any live transaction."

## After intake is complete
1. Run relevant skill flow from `playbooks/SKILL.md`.
2. For cross-chain: run `bridge.preflight` first.
3. Validate bridge targets with `bridge.validateAddress`.
4. Simulate before write.
5. Ask explicit final confirmation before sending live tx.
