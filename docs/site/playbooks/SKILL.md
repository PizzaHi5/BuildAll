# Capability Playbooks (All Chains)

Use these deterministic mappings from user intent -> command sequence.

## A) EVM token transfer (ERC-20)
1. `token.balance`
2. `token.transfer` (`simulate:true`)
3. `token.transfer` (`simulate:false`)

## B) EVM swap (Uniswap)
1. Prefer Uniswap skill/API path first (https://api-docs.uniswap.org/introduction)
2. `dex.quote`
3. `token.approve` (`simulate:true` then execute)
4. `dex.swap` (`simulate:true` then execute)
5. If API route metadata is available, enforce returned route/slippage constraints

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

## H) 0G inference route
1. `og.models`
2. Select model ID and build user/system prompts
3. `og.inference`
4. Return inference output + model metadata
