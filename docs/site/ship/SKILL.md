# Ship (Start Here)

Use this flow for any onchain task.

## Step 1: Classify user intent
- Token transfer/approve/balance → ERC-20
- NFT owner/transfer/URI → ERC-721
- Swap/quote/pool state → DEX
- Supply/borrow/repay/withdraw → Lending
- Vault debt/mint/repay DAI → Stablecoin
- Price feed checks → Oracle
- Collection/listings/assets → NFT Marketplace

## Step 2: Build command input
- Select `chain`
- Select `command`
- Set required addresses/amounts/tokenId

## Step 3: Simulate writes
Always pass `"simulate": true` on writes first.

## Step 4: Validate constraints
- Address format
- Token decimals and amount units
- Slippage bounds for swaps
- Wallet/key availability for writes

## Step 5: Execute
Set `simulate` to `false`, submit tx, return tx hash and concise status.

## Step 6: Post-tx checks
- Read updated state (balance, health factor, owner, etc.)
- Return confirmation + next recommended action
