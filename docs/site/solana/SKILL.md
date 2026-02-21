# Solana Core Skill (Mainnet Send/Receive)

## Commands
- `solana.balance` (read SOL balance)
- `solana.tx` (read transaction by signature)
- `solana.transfer` (write SOL transfer)
- `solana.spl.balance` (read SPL token balance)
- `solana.spl.transfer` (write SPL token transfer)
- `solana.tx.sendRaw` (broadcast any signed Solana transaction)

## Write prerequisites
- Set `SOLANA_PRIVATE_KEY` in `.env` (base58 or JSON byte array).
- Start with `"simulate": true` for transfers.

## Patterns
```json
{"to":"<solana_address>","lamports":1000000,"simulate":true}
{"mint":"<spl_mint>","toOwner":"<solana_address>","amountRaw":"1000000","simulate":true}
{"signedTxBase64":"<base64_signed_tx>","simulate":false}
```

## Why `sendRaw` matters
`solana.tx.sendRaw` is protocol-agnostic and can execute transactions for Serum, Raydium, Solend, Mango, Magic Eden, and bridge programs as long as the transaction is properly built and signed.
