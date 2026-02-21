# BuildAll Skills Index (Agent Entry)

Fetch this first.

**Mandatory order:** open `/onboarding/SKILL.md` first and collect required user data in your first response.

This index routes agents to focused markdown skill pages for major onchain actions.

## All skills
- `https://pizzahi5.github.io/BuildAll/SKILL.md`

## Individual skill pages
- `https://pizzahi5.github.io/BuildAll/onboarding/SKILL.md` — FIRST STEP: required user intake + first response template
- `https://pizzahi5.github.io/BuildAll/ship/SKILL.md` — End-to-end execution flow
- `https://pizzahi5.github.io/BuildAll/erc20/SKILL.md` — ERC-20 token operations
- `https://pizzahi5.github.io/BuildAll/erc721/SKILL.md` — ERC-721 NFT operations
- `https://pizzahi5.github.io/BuildAll/dex/SKILL.md` — DEX (Uniswap v3) quote/swap/pool state
- `https://pizzahi5.github.io/BuildAll/lending/SKILL.md` — Lending (Aave v3)
- `https://pizzahi5.github.io/BuildAll/stablecoin/SKILL.md` — Stablecoin (Maker vault baseline)
- `https://pizzahi5.github.io/BuildAll/oracle/SKILL.md` — Oracle (Chainlink feeds)
- `https://pizzahi5.github.io/BuildAll/nft-marketplace/SKILL.md` — NFT marketplace (OpenSea reads)
- `https://pizzahi5.github.io/BuildAll/addresses/SKILL.md` — Canonical addresses/chains keys
- `https://pizzahi5.github.io/BuildAll/solana/SKILL.md` — Solana core send/receive skills
- `https://pizzahi5.github.io/BuildAll/solana-serum/SKILL.md` — Serum/OpenBook orderbook execution pattern
- `https://pizzahi5.github.io/BuildAll/solana-raydium/SKILL.md` — Raydium AMM execution pattern
- `https://pizzahi5.github.io/BuildAll/solana-solend/SKILL.md` — Solend lending execution pattern
- `https://pizzahi5.github.io/BuildAll/solana-mango/SKILL.md` — Mango derivatives execution pattern
- `https://pizzahi5.github.io/BuildAll/solana-pyth/SKILL.md` — Pyth oracle pattern
- `https://pizzahi5.github.io/BuildAll/solana-magiceden/SKILL.md` — Magic Eden NFT pattern
- `https://pizzahi5.github.io/BuildAll/bridging/SKILL.md` — Cross-chain bridge + Coinbase fallback playbook
- `https://pizzahi5.github.io/BuildAll/injective/SKILL.md` — Injective DEX/derivatives/tokens/IBC
- `https://pizzahi5.github.io/BuildAll/near/SKILL.md` — NEAR NEP-141 + Ref/Burrow/Paras patterns
- `https://pizzahi5.github.io/BuildAll/hedera/SKILL.md` — Hedera HTS/HCS/USDC/HSC patterns
- `https://pizzahi5.github.io/BuildAll/ibc/SKILL.md` — Cosmos IBC bridging playbook
- `https://pizzahi5.github.io/BuildAll/preflight/SKILL.md` — Deterministic bridge preflight planner
- `https://pizzahi5.github.io/BuildAll/playbooks/SKILL.md` — Intent -> command execution playbooks
- `https://pizzahi5.github.io/BuildAll/docs/bridge-registry/README.md` — Verified bridge registry + validation commands

## Chain keys
- `ethereum`
- `base`
- `arbitrum`
- `optimism`
- `polygon`
- `solana`
- `injective`
- `near`
- `hedera`

## Universal command format
```bash
chain-skills -c <command> -i '<json_input>'
```

## Safety policy
1. Simulate first for writes: `"simulate": true`
2. Confirm chain + contract addresses
3. Enforce slippage for swaps (`amountOutMinimum`)
4. Execute only after simulation is clean

## Response contract
```json
{
  "ok": true,
  "data": {},
  "meta": {
    "chain": "base",
    "network": "Base",
    "simulated": true,
    "latencyMs": 123
  }
}
```
