# Algorand Core Skill

## Commands

### Reads (no key required)
- `algorand.balance` — ALGO balance + opted-in assets for an address
- `algorand.asset.balance` — ASA (Algorand Standard Asset) balance for an address
- `algorand.tx` — Transaction detail by ID (via Indexer)
- `algorand.asset.info` — ASA metadata (name, unit, decimals, total supply, creator)
- `algorand.app.info` — Smart contract application state + global schema

### Writes (require `browserConfirmed: true`)
- `algorand.transfer` — Native ALGO payment
- `algorand.asset.transfer` — ASA transfer (receiver must already be opted in)
- `algorand.asset.optIn` — Opt a wallet into an ASA
- `algorand.tx.sendRaw` — Broadcast any pre-signed transaction (base64 msgpack)

## Write prerequisites
- Set `ALGORAND_MNEMONIC` in `.env` (25-word BIP-39 mnemonic).
- Free public nodes available — no `ALGORAND_ALGOD_TOKEN` needed for AlgoNode.
- Always start with `"simulate": true` before broadcasting writes.
- Receiver must be opted into an ASA before you can transfer it to them.

## Environment
```
ALGORAND_ALGOD_URL=https://mainnet-api.algonode.cloud    # or custom node
ALGORAND_INDEXER_URL=https://mainnet-idx.algonode.cloud  # for tx lookups
ALGORAND_ALGOD_TOKEN=                                    # leave blank for AlgoNode
ALGORAND_MNEMONIC=word1 word2 ... word25                 # 25-word mnemonic
```

## Patterns
```json
{"address":"<algorand_address>"}
{"address":"<algorand_address>","assetId":31566704}
{"to":"<algorand_address>","microAlgos":1000000,"simulate":true}
{"assetId":31566704,"to":"<algorand_address>","amount":1000000,"simulate":true}
{"assetId":31566704,"simulate":true}
{"signedTxBase64":"<base64_msgpack_signed_tx>","simulate":false,"browserConfirmed":true}
```

## Units
- 1 ALGO = 1,000,000 microALGOs (like lamports on Solana)
- ASA amounts are raw integers — divide by `10^decimals` for display

## Notable ASAs (MainNet)
| Asset | ID | Symbol |
|---|---|---|
| USD Coin | 31566704 | USDC |
| Tether | 312769 | USDt |
| Wrapped Ether | 887406851 | WETH |
| Wrapped BTC | 1058926737 | WBTC |

## Why `sendRaw` matters
`algorand.tx.sendRaw` is protocol-agnostic and can execute transactions for Tinyman, Pact, Algofi, and any other Algorand dApp as long as the transaction group is properly built and signed (e.g. via Pera Wallet or Defly).

## Wallets
Pera Wallet (mobile + web) and Defly are the primary Algorand browser/mobile wallets for confirming write operations.
