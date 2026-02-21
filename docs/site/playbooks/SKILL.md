# Capability Playbooks (All Chains)

Use these deterministic mappings from user intent -> command sequence.

## A) EVM token transfer (ERC-20)
1. `token.balance`
2. `token.transfer` (`simulate:true`)
3. `token.transfer` (`simulate:false`)

## B) EVM swap (Uniswap v3)
1. `dex.quote`
2. `token.approve` (`simulate:true` then execute)
3. `dex.swap` (`simulate:true` then execute)

## C) Solana SPL transfer
1. `solana.spl.balance`
2. `solana.spl.transfer` (`simulate:true`)
3. `solana.spl.transfer` (`simulate:false`)

## D) Injective spot/derivatives route
1. `injective.dex.spotMarkets` or `injective.dex.derivativeMarkets`
2. Build/sign tx off-chain
3. `injective.tx.broadcast`

## E) NEAR NEP-141 + Ref/Burrow
1. `near.nep141.balance`
2. `near.ref.pools` or `near.burrow.account`
3. Build/sign tx off-chain
4. `near.tx.broadcast`

## F) Hedera HTS/HCS/HSC
1. `hedera.hts.tokenInfo` / `hedera.hcs.messages`
2. For EVM contract actions: `hedera.evm.call`
3. Write path: `hedera.evm.sendRaw`

## G) Cross-chain bridge route
1. `bridge.preflight`
2. `bridge.validateAddress` for all bridge targets
3. Execute direct bridge OR Coinbase fallback actionPlan
4. Confirm destination balance/state
