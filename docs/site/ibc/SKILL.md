# IBC Bridging Skill (Cosmos Interchain)

Use this when bridging to/from Injective and Cosmos zones.

## Steps
1. Identify source chain, destination chain, source denom.
2. Resolve IBC transfer channel/port (`transfer`) and expected receiving denom.
3. For destination denom verification, use `injective.ibc.denomTrace` where applicable.
4. Build and sign IBC transfer tx off-chain.
5. Broadcast with chain-specific tx broadcaster (Injective: `injective.tx.broadcast`).
6. Confirm packet relay/ack and final balance on destination chain.

## Guardrails
- Never assume native denom on destination; always trace hash.
- Show relay fees and timeout settings before execution.
