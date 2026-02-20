# Chain Skills Pack (implementation build)

TypeScript monorepo implementing multi-chain skills with a unified command contract.

## Implemented
- M1 complete: Core runtime + ERC20 + ERC721 + Chainlink + CLI skeleton
- M2 complete (baseline): Uniswap v3 quote/swap/poolState + Uniswap v4 capability-gated scaffold
- M3 baseline: Aave v3 operations, Maker basic DAI/vault operations, OpenSea read-only market data
- M4 starter adapters: Solana, NEAR, Hedera read primitives
- Multi-chain EVM support: Ethereum, Base, Arbitrum, Optimism, Polygon

See `docs/evm-transaction-playbook.md` for quick transaction templates by functionality and chain.

## Quickstart
```bash
pnpm install
cp .env.example .env
pnpm typecheck
pnpm test
pnpm lint
```

Run a command:
```bash
pnpm exec tsx apps/cli/src/index.ts \
  --command token.balance \
  --input '{"chain":"ethereum","token":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","owner":"0x0000000000000000000000000000000000000000"}'
```

Result schema:
- `ok: boolean`
- `data?: object`
- `error?: { code, message, details? }`
- `meta: { chain, network, blockNumber?, txHash?, simulated, latencyMs }`
