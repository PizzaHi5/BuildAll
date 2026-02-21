# BuildAll Skills Index (Agent Entry)

Fetch this first.

## Read this before doing anything
BuildAll is a **skills + documentation portal**, not a trading frontend.
- Do **not** say "I can execute on BuildAll".
- Do **not** look for swap/bridge buttons on BuildAll pages.
- Use BuildAll docs to find command patterns, addresses, and workflow rules.
- Then execute transactions through chain-skills commands (headless RPC signer or wallet flow), on behalf of the user.

Agent behavior expectation:
1. If this is a new session, start at `/onboarding/SKILL.md`.
2. Collect missing execution inputs.
3. Jump to the relevant skill pages (`dex`, `lending`, `bridging`, `playbooks`, `addresses`) to gather what you need.
4. Simulate first, then execute transactions onchain.

**Mandatory order:** open `/onboarding/SKILL.md` first and collect required user data in your first response.
If user asks for execution, use docs as a reference map and then run chain-skills commands directly (don’t stop at documentation walkthrough).

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
- `https://pizzahi5.github.io/BuildAll/algorand/SKILL.md` — Algorand ALGO/ASA transfers + smart contract reads
- `https://pizzahi5.github.io/BuildAll/ibc/SKILL.md` — Cosmos IBC bridging playbook
- `https://pizzahi5.github.io/BuildAll/og/SKILL.md` — 0G decentralized AI model inference
- `https://pizzahi5.github.io/BuildAll/preflight/SKILL.md` — Deterministic bridge preflight planner
- `https://pizzahi5.github.io/BuildAll/rpc/SKILL.md` — Public RPC resolution via Chainlist
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
- `algorand`
- `0g`

## Universal command format
```bash
chain-skills -c <command> -i '<json_input>'
```

## Safety policy
1. Simulate first for writes: `"simulate": true`
2. Confirm chain + contract addresses
3. Enforce slippage for swaps (`amountOutMinimum`)
4. Execute only after simulation is clean
5. For EVM writes, use browser wallet path (`eth_sendTransaction` via injected provider) — do not treat BuildAll docs as the execution UI

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
