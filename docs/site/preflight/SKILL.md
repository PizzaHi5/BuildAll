# Preflight Skill (Deterministic Agent Planner)

This is the mandatory planning layer before any cross-chain execution.

## Primary command
- `bridge.preflight`

## Why this exists
Agents should not improvise route logic. `bridge.preflight` returns a deterministic plan with:
- route candidates by protocol (wormhole/allbridge)
- compatibility status + reasons
- selected strategy (`direct-bridge` or `coinbase-fallback`)
- required credentials/scopes for fallback
- ordered action steps
- guardrails

## Input
```json
{
  "sourceChain": "arbitrum",
  "destinationChain": "solana",
  "sourceToken": "USDC",
  "destinationToken": "SOL",
  "preferredProtocols": ["wormhole", "allbridge"]
}
```

## Output fields agents must use
- `routeCandidates`
- `selectedStrategy`
- `requiresCoinbaseApiKey`
- `coinbaseRequiredScopes`
- `actionPlan`
- `guardrails`

## Execution policy
1. Run `bridge.preflight` first.
2. If `selectedStrategy=direct-bridge`:
   - validate route targets via `bridge.validateAddress`
   - simulate and quote
   - execute in listed order
3. If `selectedStrategy=coinbase-fallback`:
   - request Coinbase API key
   - confirm required scopes: Trade, View, Transfer
   - follow action plan strictly
4. Require explicit user confirmation before funds movement.

## Related commands
- `bridge.registry`
- `bridge.validateAddress`
