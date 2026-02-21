# RPC Resolution Skill

Use this when onboarding a user who chooses public RPC endpoints.

## Command
- `rpc.resolve`

## Behavior
- Fetches `https://chainlist.org/rpcs.json`
- Matches required chain
- Selects the first active HTTP(S) RPC URL

## Input
```json
{"chain":"ethereum"}
```

## Output
- `chain`
- `chainId`
- `rpcUrl`
- `source` (`chainlist`)

## Supported chain keys
- `ethereum`
- `base`
- `arbitrum`
- `optimism`
- `polygon`

## Onboarding policy
If user says "use public RPC", call `rpc.resolve` for every required chain before execution.
