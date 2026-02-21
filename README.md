# BuildAll Chain Skills Pack

Multi-chain smart-contract skill layer designed for chat-first agents.

This repo gives an agent one consistent interface to perform major DeFi/NFT tasks on EVM chains.

## What this enables

An agent can route user intent ("swap", "borrow", "check NFT owner", "get oracle price") into executable blockchain calls with deterministic outputs.

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
- `https://pizzahi5.github.io/BuildAll/preflight/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/playbooks/SKILL.md`
- `https://pizzahi5.github.io/BuildAll/docs/bridge-registry/README.md`

---

## Output contract

All commands return:
- `ok: boolean`
- `data?: object`
- `error?: { code, message, details? }`
- `meta: { chain, network, blockNumber?, txHash?, simulated, latencyMs }`
