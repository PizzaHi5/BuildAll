# Ethereum Protocol Integration Reference (Implementation-Ready)

Last updated: 2026-02-19 PST

> Focus: practical addresses, minimal ABI signatures, and gotchas for `CHAIN_SKILLS_PRD.md` v1 scope.

---

## 1) ERC-20 (generic)

### Canonical addresses
- N/A (standard interface; token-specific address required per asset/network).

### Core ABI signatures (minimum)
```solidity
function name() external view returns (string)
function symbol() external view returns (string)
function decimals() external view returns (uint8)
function totalSupply() external view returns (uint256)
function balanceOf(address owner) external view returns (uint256)
function allowance(address owner, address spender) external view returns (uint256)
function approve(address spender, uint256 amount) external returns (bool)
function transfer(address to, uint256 amount) external returns (bool)
function transferFrom(address from, address to, uint256 amount) external returns (bool)

event Transfer(address indexed from, address indexed to, uint256 value)
event Approval(address indexed owner, address indexed spender, uint256 value)
```

### Caveats
- Some tokens don’t return `bool` on `transfer/approve`; use safe wrappers.
- `decimals()` is optional in strict ERC-20 practice (but present in most production tokens).
- Handle allowance reset patterns (`approve(0)` then `approve(new)`) for older tokens.

References: [EIP-20](https://eips.ethereum.org/EIPS/eip-20)

---

## 2) ERC-721 (generic)

### Canonical addresses
- N/A (collection contract address required).

### Core ABI signatures (minimum)
```solidity
function balanceOf(address owner) external view returns (uint256)
function ownerOf(uint256 tokenId) external view returns (address)
function safeTransferFrom(address from, address to, uint256 tokenId) external
function transferFrom(address from, address to, uint256 tokenId) external
function approve(address to, uint256 tokenId) external
function setApprovalForAll(address operator, bool approved) external
function getApproved(uint256 tokenId) external view returns (address)
function isApprovedForAll(address owner, address operator) external view returns (bool)
function tokenURI(uint256 tokenId) external view returns (string)
```

### Caveats
- `tokenURI()` is part of metadata extension; may revert for non-metadata contracts.
- Prefer `safeTransferFrom` when recipient may be a contract.

References: [EIP-721](https://eips.ethereum.org/EIPS/eip-721)

---

## 3) USDC

### Canonical addresses
- **Ethereum mainnet**: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **Ethereum Sepolia**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

### Core ABI signatures
Use standard ERC-20 methods above.

### Caveats
- USDC uses **6 decimals**.
- Circle maintains official chain-by-chain address mapping; don’t hardcode from third-party lists.

References: [Circle official USDC addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses)

---

## 4) Chainlink price feeds

### Canonical feed proxies (ETH/USD)
- **Ethereum mainnet**: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- **Ethereum Sepolia**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`

### Core ABI signatures (`AggregatorV3Interface`)
```solidity
function decimals() external view returns (uint8)
function description() external view returns (string memory)
function version() external view returns (uint256)
function getRoundData(uint80 _roundId)
  external view
  returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
function latestRoundData()
  external view
  returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```

### Caveats
- Read from the **proxy**, not aggregator implementation, for upgrade safety.
- Enforce freshness checks on `updatedAt` (`STALE_ORACLE_DATA`).
- Normalize by `decimals()` before returning price data.

References: [Chainlink API reference](https://docs.chain.link/data-feeds/api-reference), [Mainnet feed contract](https://etherscan.io/address/0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419)

---

## 5) Uniswap v3 / v4

## Uniswap v3

### Canonical addresses
- **Mainnet**
  - SwapRouter: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
  - QuoterV2: `0x61fFE014bA17989E743c5F6cB21bF9697530B21e`
  - NonfungiblePositionManager: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- **Sepolia**
  - SwapRouter02: `0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E`
  - QuoterV2: `0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3`
  - NonfungiblePositionManager: `0x1238536071E1c677A632429e3655c799b22cDA52`

### Core ABI signatures
```solidity
// ISwapRouter (v3)
function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96) params)
  external payable returns (uint256 amountOut)

// IQuoterV2
function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96) params)
  external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)
```

### Caveats
- `IQuoterV2` methods are non-view and should be called via `eth_call`/simulation.
- `exactInputSingle` requires strict slippage guards (`amountOutMinimum`).

References: [Uniswap v3 Ethereum deployments](https://docs.uniswap.org/contracts/v3/reference/deployments/ethereum-deployments)

## Uniswap v4

### Canonical addresses
- **Mainnet**
  - PoolManager: `0x000000000004444c5dc75cB358380D2e3dE08A90`
  - V4 Quoter: `0x52f0e24d1c21c8a0cb1e5a5dd6198556bd9e1203`
  - Universal Router: `0x66a9893cc07d91d95644aedd05d03f95e1dba8af`
- **Sepolia**
  - Not listed in current v4 deployments page (use capability-flagged `read/quote only` fallback until official deployment mapping is published).

### Core ABI signatures (practical)
```solidity
// Universal Router entrypoint
function execute(bytes commands, bytes[] inputs, uint256 deadline) external payable

// V4 periphery quoter (contract-specific; pin ABI to deployed release tag)
```

### Caveats
- v4 periphery ABI surface is evolving; pin package/release and chain-specific addresses.
- Keep `NOT_IMPLEMENTED_WRITE` behavior for unstable write paths (per PRD).

References: [Uniswap v4 deployments](https://docs.uniswap.org/contracts/v4/deployments)

---

## 6) Aave v3 (pool + data provider)

### Canonical addresses
- **Mainnet**
  - PoolAddressesProvider: `0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e`
  - Pool: `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2`
  - AaveProtocolDataProvider: `0x0a16f2FCC0D44FaE41cc54e079281D84A363bECD`
- **Sepolia**
  - PoolAddressesProvider: `0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A`
  - Pool: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`
  - AaveProtocolDataProvider: `0x3e9708d80f7B3e43118013075F7e95CE3AB31F31`

### Core ABI signatures
```solidity
// IPool
function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external
function withdraw(address asset, uint256 amount, address to) external returns (uint256)
function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external
function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) external returns (uint256)
function getUserAccountData(address user)
  external view
  returns (uint256 totalCollateralBase,uint256 totalDebtBase,uint256 availableBorrowsBase,uint256 currentLiquidationThreshold,uint256 ltv,uint256 healthFactor)

// IPoolDataProvider
function getReserveData(address asset)
  external view
  returns (...)
function getUserReserveData(address asset, address user)
  external view
  returns (...)
```

### Caveats
- `interestRateMode`: variable is typically `2` in v3 flows.
- Supply/repay require ERC-20 approvals first.

References: [Aave Address Book repo](https://github.com/aave-dao/aave-address-book), [AaveV3Ethereum.sol](https://raw.githubusercontent.com/aave-dao/aave-address-book/main/src/AaveV3Ethereum.sol), [AaveV3Sepolia.sol](https://raw.githubusercontent.com/aave-dao/aave-address-book/main/src/AaveV3Sepolia.sol)

---

## 7) Maker (basic DAI / Vault ops)

### Canonical addresses (mainnet)
- CDP Manager (`CDP_MANAGER`): `0x5ef30b9986345249bc32d8928B7ee64DE9435E39`
- Vat (`MCD_VAT`): `0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B`
- Jug (`MCD_JUG`): `0x19c0976f590D67707E62397C87829d896Dc0f1F1`
- Spot (`MCD_SPOT`): `0x65C79fcB50Ca1594B025960e539eD7A9a6D434A3`
- Dai token (`MCD_DAI`): `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- DaiJoin (`MCD_JOIN_DAI`): `0x9759A6Ac90977b93B58547b4A71c78317f391A28`
- ETH-A GemJoin (`MCD_JOIN_ETH_A`): `0x2F0b23f53734252Bda2277357e97e1517d6B042A`
- ProxyActions: `0x82ecD135Dce65Fbc6DbdD0e4237E0AF93FFD5038`

> Sepolia: no canonical Maker deployment set in current chainlog API; treat Maker support as mainnet-only unless you define your own test deployment map.

### Core ABI signatures (practical subset)
```solidity
// DssCdpManager
function open(bytes32 ilk, address usr) external returns (uint256 cdp)
function urns(uint256 cdp) external view returns (address)
function ilks(uint256 cdp) external view returns (bytes32)
function owns(uint256 cdp) external view returns (address)
function frob(uint256 cdp, int256 dink, int256 dart) external

// Jug / Vat
function drip(bytes32 ilk) external returns (uint256 rate)
function urns(bytes32 ilk, address urn) external view returns (uint256 ink, uint256 art)
function ilks(bytes32 ilk) external view returns (...)

// DaiJoin
function join(address urn, uint256 wad) external
function exit(address usr, uint256 wad) external
```

### Caveats
- **Use DSProxy + ProxyActions** for user flows; direct low-level calls can strand/lose control of vaults.
- Must call `Jug.drip(ilk)` before debt math-sensitive operations.
- Units differ (`wad` 1e18, `ray` 1e27, `rad` 1e45).

References: [Maker chainlog API (active mainnet map)](https://chainlog.sky.money/api/mainnet/active.json), [Proxy Actions docs](https://docs.makerdao.com/smart-contract-modules/proxy-module/proxy-actions-detailed-documentation)

---

## 8) OpenSea API (read-only metadata)

### Base
- API base: `https://api.opensea.io/api/v2`
- Auth: API key via `X-API-KEY` header (recommended for stable limits).

### Practical endpoints
- **Get single NFT metadata**  
  `GET /chain/{chain}/contract/{address}/nfts/{identifier}`
- **Get NFTs by contract**  
  `GET /chain/{chain}/contract/{address}/nfts`
- **Get NFTs by account**  
  `GET /chain/{chain}/account/{address}/nfts`
- **Collections** (slug/collection reads; path variants may change by doc version — pin to currently published endpoint docs in your SDK wrapper)

### Caveats
- Endpoint paths can change with docs versioning; keep OpenSea adapter behind a small path-mapping layer.
- Respect rate limits and retries; don’t treat OpenSea as onchain truth source.

References: [OpenSea API overview](https://docs.opensea.io/reference/api-overview), [Get NFT endpoint](https://docs.opensea.io/reference/get_nft), [OpenSea endpoint index/search](https://docs.opensea.io/reference)

---

## 9) Recommended implementation defaults

- Keep address maps by `{protocol -> chainId -> contract}` with checksum addresses.
- Add runtime network guard (`chainId` mismatch -> hard fail).
- For write methods: always expose `simulate=true`; compute and return calldata + expected state deltas when possible.
- Version-pin ABIs for Uniswap v4 and OpenSea client wrappers.
