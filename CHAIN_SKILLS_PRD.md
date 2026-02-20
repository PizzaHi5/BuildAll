# Chain Skills Pack — Product + Engineering Requirements (v1)

Owner: Vector (CTA)
Execution: coding-agent
Status: Approved for implementation

## 1) Goal
Build a local-first blockchain skills toolkit that can:
- Interact with major Ethereum smart contract standards/protocols.
- Expose clean, reusable commands for agent usage.
- Support fast operation with minimal approval friction.
- Expand beyond EVM to Solana, NEAR, and Hedera.

Primary outcome: an operator can run read/simulate/write blockchain tasks through a consistent API, starting with Ethereum and extensible cross-chain adapters.

## 2) Scope (v1)

### In scope
1. **Core runtime**
   - TypeScript implementation (preferred for speed + ecosystem).
   - Local execution environment.
   - Config-driven chain/provider registry.
   - Wallet support via private key or mnemonic env vars.
   - Transaction pipeline (prepare -> estimate -> send -> track).
   - Dry-run/simulate mode for write methods.

2. **Ethereum protocol support**
   - ERC-20 generic interface + USDC convenience methods.
   - ERC-721 generic interface.
   - Uniswap v3: quote + swap (exactInputSingle minimally).
   - Uniswap v4: quote/read support + swap path where SDK/contracts permit stable integration.
   - Aave v3: supply, borrow, repay, withdraw + account health reads.
   - MakerDAO: read positions + basic DAI operations (mint/repay where practical).
   - Chainlink: price feed reads with staleness checks.
   - OpenSea: read-only market data adapter.

3. **Non-EVM initial adapters**
   - Solana adapter skeleton + balance/tx read primitives.
   - NEAR adapter skeleton + account/balance read primitives.
   - Hedera adapter skeleton + account/token read primitives.

4. **Skill API layer**
   - Unified command naming and payload schema.
   - Standardized error model and result metadata.

5. **Quality**
   - Unit tests for core utilities.
   - Integration tests (mocked where mainnet impractical).
   - CLI examples and quickstart docs.

### Out of scope (v1)
- Full OpenSea order fulfillment + listing writes.
- Advanced Maker vault strategies.
- Cross-chain bridging and MEV features.
- Production hosted service deployment.

## 3) Architecture requirements

## 3.1 Modules
- `packages/core` — shared types, config, errors, logging, retries.
- `packages/evm` — EVM provider/wallet/tx engine.
- `packages/protocols` — protocol clients:
  - `erc20`, `erc721`, `uniswap-v3`, `uniswap-v4`, `aave-v3`, `maker`, `chainlink`, `opensea`.
- `packages/chains` — non-EVM adapters:
  - `solana`, `near`, `hedera`.
- `packages/skills` — high-level skill command handlers.
- `apps/cli` — command-line interface for local operation and testing.

## 3.2 Skill command contract
Each command returns:
- `ok: boolean`
- `data?: object`
- `error?: { code: string; message: string; details?: object }`
- `meta: { chain, network, blockNumber?, txHash?, simulated, latencyMs }`

## 3.3 Safety/ops defaults
- Speed-biased defaults per user instruction.
- No mandatory human confirmation gate in code path.
- Guardrails still required:
  - Max slippage default 0.5% (override allowed).
  - Max gas limit cap by config.
  - RPC timeout + retry strategy.
  - Explicit `simulate=true` option on write methods.

## 4) Functional requirements

## 4.1 Core/EVM
- Connect to Ethereum mainnet and configurable EVM networks.
- Resolve token metadata (`symbol`, `decimals`, `name`).
- Parse/format units safely (bigint).
- Build, sign, and broadcast tx.
- Poll tx receipt with configurable timeout.

## 4.2 ERC-20
Commands:
- `token.balance({ chain, token, owner })`
- `token.allowance({ chain, token, owner, spender })`
- `token.approve({ chain, token, spender, amount, simulate? })`
- `token.transfer({ chain, token, to, amount, simulate? })`
- `usdc.balance({ chain, owner })` (USDC map by chain)

## 4.3 ERC-721
Commands:
- `nft.ownerOf({ chain, contract, tokenId })`
- `nft.balanceOf({ chain, contract, owner })`
- `nft.transfer({ chain, contract, tokenId, to, simulate? })`
- `nft.tokenUri({ chain, contract, tokenId })`

## 4.4 Uniswap v3/v4
Commands:
- `dex.quote({ protocol, chain, tokenIn, tokenOut, amountIn, feeTier? })`
- `dex.swap({ protocol, chain, tokenIn, tokenOut, amountIn, slippageBps?, recipient?, simulate? })`
- `dex.poolState({ protocol, chain, poolOrParams })`

Requirements:
- v3 production path first.
- v4 implemented with clear capability flags; where write support is unstable, return `NOT_IMPLEMENTED_WRITE` with guidance while preserving read/quote support.

## 4.5 Aave
Commands:
- `lending.marketData({ chain, asset })`
- `lending.health({ chain, account })`
- `lending.supply({ chain, asset, amount, onBehalfOf?, simulate? })`
- `lending.borrow({ chain, asset, amount, rateMode, simulate? })`
- `lending.repay({ chain, asset, amount, rateMode, simulate? })`
- `lending.withdraw({ chain, asset, amount, to?, simulate? })`

## 4.6 MakerDAO (basic)
Commands:
- `maker.vaults({ chain, owner })`
- `maker.collateralTypes({ chain })`
- `maker.daiDebt({ chain, vaultId })`
- `maker.mintDaiBasic({ chain, vaultId, amount, simulate? })`
- `maker.repayDaiBasic({ chain, vaultId, amount, simulate? })`

## 4.7 Chainlink
Commands:
- `oracle.price({ chain, feed })`
- `oracle.priceByPair({ chain, base, quote })`

Include freshness validation:
- Fail with `STALE_ORACLE_DATA` if `updatedAt` older than configured threshold.

## 4.8 OpenSea (read-only)
Commands:
- `opensea.collection({ slug })`
- `opensea.floor({ slug })`
- `opensea.listings({ slug, limit? })`
- `opensea.asset({ contract, tokenId })`

## 4.9 Solana / NEAR / Hedera starter support
Commands (minimum):
- `solana.balance({ owner })`
- `solana.tx({ signature })`
- `near.account({ accountId })`
- `near.balance({ accountId })`
- `hedera.account({ accountId })`
- `hedera.token({ tokenId })`

## 5) Non-functional requirements
- TypeScript strict mode enabled.
- Lint + format configured.
- Deterministic error codes.
- No secrets logged.
- README with setup and runnable examples.

## 6) Deliverables
1. Monorepo/project scaffold with modules above.
2. Implemented command handlers for listed operations.
3. `.env.example` with provider/API settings.
4. Test suite and scripts:
   - `pnpm test`
   - `pnpm lint`
   - `pnpm typecheck`
5. `docs/` folder:
   - Protocol coverage matrix.
   - Known limitations and roadmap.

## 7) Milestones
- M1: Core + ERC20/721 + Chainlink + CLI skeleton.
- M2: Uniswap v3/v4 + Aave.
- M3: Maker basic + OpenSea read-only.
- M4: Solana/NEAR/Hedera starter adapters + unified docs/tests.

## 8) Acceptance criteria
- All M1-M4 commands compile and execute against configured environments.
- Read commands return normalized schema.
- Write commands support simulate mode and tx metadata.
- Test/lint/typecheck pass in CI/local.
- Documentation sufficient for another engineer to run within 20 minutes.

## 9) Implementation notes
- Prefer mature libraries to reduce delivery risk:
  - EVM: `viem` (or `ethers` if implementation friction lower).
  - Solana: `@solana/web3.js`
  - NEAR: `near-api-js`
  - Hedera: `@hashgraph/sdk`
- Prioritize pragmatic wrappers over over-abstraction.
- Keep protocol addresses configurable by network map files.
