# ERC-20 Skill

## Commands
- `token.balance`
- `token.allowance`
- `token.approve` (write)
- `token.transfer` (write)
- `usdc.balance`

## Required input patterns
```json
{"chain":"base","token":"0x...","owner":"0x..."}
{"chain":"base","token":"0x...","spender":"0x...","amount":"1000000","simulate":true}
```

## Notes
- Amounts are raw units (respect token decimals).
- For old tokens, allowance reset pattern may be required (`approve(0)` then `approve(new)`).
