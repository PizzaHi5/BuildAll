# BuildAll Chain Skills Pack

Multi-chain smart-contract skill layer designed for chat-first agents.

This repo gives an agent one consistent interface to perform major DeFi/NFT tasks on EVM chains.

## What this enables

An agent can route user intent ("swap", "borrow", "check NFT owner", "get oracle price") into executable blockchain calls with deterministic outputs.

## The problem this solves

Crypto execution is still fragmented and high-friction:
- Every chain has different conventions, tooling, and protocol surfaces
- Most users still need to manage wallet complexity directly
- Agent behavior is often inconsistent because docs are scattered and non-standard

BuildAll solves this by providing a **seamless, standardized skill layer** where agents can:
- read one index and follow predictable command contracts
- safely simulate before write actions
- use deterministic playbooks for common tasks
- bridge across ecosystems with preflight + validation guardrails

In practice, this makes onchain tasks **faster, safer, and easier to automate** through chat.

### Product theory

This is designed as an agent primitive: if a blockchain has a `SKILL.md`, an agent can learn it and act.

Current phase:
- optimized for crypto-native users who already operate wallets

Future phase:
- wallet requirements can be abstracted behind `walletskills.md`-style flows so non-crypto-native users can complete blockchain tasks from chat without deep wallet/tooling knowledge.

The goal is a high-quality UX that is still difficult to achieve in crypto today: **trust-aware, chat-native, multi-chain execution**.

## Challenges encountered

### 1) Local OpenClaw setup + tool wiring
Getting OpenClaw fully usable locally required coordination across environment setup, CLI/tool auth, and runtime config consistency.

How this was addressed:
- standardized `.env.example` and per-chain config keys
- validated each change with typecheck/test/build loops
- pushed changes incrementally to keep deployment/debugging tight

### 2) Skill format design for agent readability
A major hurdle was making docs both human-readable and machine-actionable.

How this was addressed:
- adopted a strict `SKILL.md` structure per capability
- added onboarding-first policy and deterministic preflight flows
- created intent → command playbooks so agents don’t improvise unsafe paths

### 3) Multi-chain safety and bridge reliability
Bridge routes and cross-chain execution are error-prone without verified targets.

How this was addressed:
- added verified bridge registry files
- added runtime validation commands (`bridge.validateAddress`)
- added deterministic planning (`bridge.preflight`) before execution

## Use of AI tools and agents

This system is intended for **any OpenClaw agent**.

Design principles:
- no required package download for consumption of skills docs
- hosted, referenceable markdown endpoints
- trust-minimized behavior via explicit validation/simulation policies

How agents work together:
1. Agent loads `onboarding/SKILL.md` first
2. Agent collects missing user execution data
3. Agent follows capability-specific `SKILL.md` + `playbooks/SKILL.md`
4. Agent uses preflight/validation tools for cross-chain operations
5. Agent executes only after simulation + explicit user confirmation

## Frontier-tech fit (Futooooooor)

BuildAll fits directly into frontier categories:
- **AI:** turns LLM agents into deterministic blockchain operators
- **DePIN / decentralized infra adjacency:** integrates decentralized execution and decentralized inference (0G)
- **New primitives:** skill-native chain interfaces + preflight safety as reusable AI infrastructure
- **Next-gen UI/UX:** chat as the control plane for multi-chain actions
- **Big ideas:** abstracting blockchain operations behind agent skills so mainstream users can interact with onchain systems without traditional UX overhead

In short: this is an **AI primitive for cutting-edge crypto applications**.

### Supported chains
- Ethereum
- Base
- Arbitrum
- Optimism
- Polygon
- Solana
- Injective
- NEAR
- Hedera
- 0G

### Supported major functionality
- **Token standard (fungible):** ERC-20
- **NFT standard (non-fungible):** ERC-721
- **DEX (AMM):** Uniswap v3 (v4 scaffolded, write-gated)
- **Lending:** Aave v3
- **Stablecoin (crypto-collateralized):** Maker basic vault ops (Ethereum mainnet)
- **Oracle:** Chainlink feeds
- **NFT marketplace:** OpenSea read APIs
- **Solana core tx:** SOL transfer, SPL transfer/balance, raw signed tx broadcast (protocol-agnostic)
- **Injective:** Cosmos-native balances, spot/derivatives market reads, IBC denom tracing, tx broadcast
- **NEAR:** NEP-141 balances, Ref Finance/Burrow/Paras read flows, tx broadcast
- **Hedera:** HTS/HCS read flows, USDC metadata, Hedera EVM call/raw send
- **0G:** decentralized AI model discovery + inference calls (`og.models`, `og.inference`)

---

## Architecture flow (end-to-end)

1. User asks in chat (e.g. "swap 100 USDC to WETH on Base").
2. Agent maps task → command + chain + protocol inputs.
3. Skill command runs through unified CLI/runtime.
4. For writes, transaction is simulated first (`simulate=true`).
5. If valid, signed tx is submitted using configured wallet key.
6. Standard response is returned:
   - `ok`
   - `data` / `error`
   - `meta` (`chain`, `txHash`, `blockNumber`, `latencyMs`, etc.)

---

## Quick setup

```bash
pnpm install
cp .env.example .env
```

Fill `.env` for:
- RPCs (Ethereum/Base/Arbitrum/Optimism/Polygon)
- `EVM_PRIVATE_KEY` (required for write ops)
- Optional API keys (OpenSea)

Validate everything:

```bash
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

---

## Usage patterns

### 1) CLI entrypoint

```bash
chain-skills -c <command> -i '<json>'
```

Equivalent dev path:

```bash
pnpm exec tsx apps/cli/src/index.ts --command <command> --input '<json>'
```

### 2) Read examples

```bash
chain-skills -c token.balance -i '{"chain":"base","token":"0x...","owner":"0x..."}'
chain-skills -c oracle.priceByPair -i '{"chain":"polygon","base":"ETH","quote":"USD"}'
chain-skills -c lending.health -i '{"chain":"arbitrum","account":"0x..."}'
```

### 3) Write examples (safe first)

```bash
chain-skills -c token.approve -i '{"chain":"optimism","token":"0x...","spender":"0x...","amount":"1000000","simulate":true}'
chain-skills -c dex.swap -i '{"protocol":"v3","chain":"base","tokenIn":"0x...","tokenOut":"0x...","amountIn":"1000000","amountOutMinimum":"990000","recipient":"0x...","simulate":true}'
chain-skills -c lending.borrow -i '{"chain":"arbitrum","asset":"0x...","amount":"500000","rateMode":2,"simulate":true}'
```

Then set `simulate` to `false` to execute.

---

## Agent-focused docs

- `docs/evm-transaction-playbook.md` → fastest command templates for all major capabilities
- `docs/protocol-coverage-matrix.md` → what is implemented and per-chain status
- `docs/protocol-reference.md` → addresses/ABI/gotchas

---

## GitHub Pages docs portal (hosted skill site)

This repo is configured with `.github/workflows/pages.yml` to deploy a simple docs site from `docs/site/`.

After the workflow runs, your hosted docs URL should be:

- **https://pizzahi5.github.io/BuildAll/**

If not live yet:
1. Go to **Repo → Settings → Pages**
2. Set **Build and deployment** to **GitHub Actions**
3. Re-run workflow: **Deploy Docs to GitHub Pages**

This gives other agents one stable URL to learn skill commands quickly.

Agent-first markdown entrypoints (ethskills-style):
- `https://pizzahi5.github.io/BuildAll/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/onboarding/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/ship/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/erc20/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/erc721/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/dex/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/lending/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/stablecoin/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/oracle/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/nft-marketplace/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/addresses/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/solana/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/solana-serum/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/solana-raydium/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/solana-solend/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/solana-mango/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/solana-pyth/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/solana-magiceden/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/bridging/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/injective/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/near/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/hedera/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/ibc/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/og/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/preflight/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/rpc/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/playbooks/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/docs/bridge-registry/README.md`

---

## Output contract

All commands return:
- `ok: boolean`
- `data?: object`
- `error?: { code, message, details? }`
- `meta: { chain, network, blockNumber?, txHash?, simulated, latencyMs }`
