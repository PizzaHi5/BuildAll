# Solana NFT Marketplace: Magic Eden Skill

## Execution model
- Fetch listing/collection metadata from marketplace APIs where needed.
- Build buy/list/cancel transactions from Magic Eden order flow.
- Submit signed transaction with `solana.tx.sendRaw`.

## Safety
- Verify collection and mint addresses directly onchain before settlement.
