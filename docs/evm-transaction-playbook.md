# EVM Transaction Playbook (Base / Arbitrum / Optimism / Polygon / Ethereum)

Use these CLI patterns to quickly formulate transactions.

## Supported chain keys
- `ethereum`
- `base`
- `arbitrum`
- `optimism`
- `polygon`

---

## 1) Token standard (ERC-20)

### Read balance
```bash
chain-skills -c token.balance -i '{"chain":"base","token":"0x...","owner":"0x..."}'
```

### Approve spender (write)
```bash
chain-skills -c token.approve -i '{"chain":"arbitrum","token":"0x...","spender":"0x...","amount":"1000000","simulate":true}'
```

### Transfer (write)
```bash
chain-skills -c token.transfer -i '{"chain":"optimism","token":"0x...","to":"0x...","amount":"1000000","simulate":true}'
```

---

## 2) NFT standard (ERC-721)

### Read owner
```bash
chain-skills -c nft.ownerOf -i '{"chain":"polygon","contract":"0x...","tokenId":"1"}'
```

### Transfer NFT (write)
```bash
chain-skills -c nft.transfer -i '{"chain":"base","contract":"0x...","tokenId":"1","to":"0x...","simulate":true}'
```

---

## 3) DEX (AMM) – Uniswap v3

### Quote
```bash
chain-skills -c dex.quote -i '{"protocol":"v3","chain":"arbitrum","tokenIn":"0x...","tokenOut":"0x...","amountIn":"1000000","feeTier":500}'
```

### Swap (write)
```bash
chain-skills -c dex.swap -i '{"protocol":"v3","chain":"base","tokenIn":"0x...","tokenOut":"0x...","amountIn":"1000000","amountOutMinimum":"990000","recipient":"0x...","feeTier":500,"simulate":true}'
```

---

## 4) Lending – Aave v3

### Health / market data
```bash
chain-skills -c lending.health -i '{"chain":"optimism","account":"0x..."}'
chain-skills -c lending.marketData -i '{"chain":"polygon","asset":"0x..."}'
```

### Supply / borrow / repay / withdraw (write)
```bash
chain-skills -c lending.supply -i '{"chain":"arbitrum","asset":"0x...","amount":"1000000","simulate":true}'
chain-skills -c lending.borrow -i '{"chain":"arbitrum","asset":"0x...","amount":"500000","rateMode":2,"simulate":true}'
chain-skills -c lending.repay -i '{"chain":"arbitrum","asset":"0x...","amount":"100000","rateMode":2,"simulate":true}'
chain-skills -c lending.withdraw -i '{"chain":"arbitrum","asset":"0x...","amount":"100000","simulate":true}'
```

---

## 5) Stablecoin (crypto-collateralized)

Current executable stablecoin module is `maker.*` and is **Ethereum mainnet only** in this release.

```bash
chain-skills -c maker.vaults -i '{"chain":"ethereum","owner":"0x..."}'
chain-skills -c maker.mintDaiBasic -i '{"chain":"ethereum","vaultId":"1234","amount":"1000000000000000000","simulate":true}'
```

---

## 6) Oracle – Chainlink

### By known pair map
```bash
chain-skills -c oracle.priceByPair -i '{"chain":"polygon","base":"ETH","quote":"USD"}'
```

### By explicit feed address
```bash
chain-skills -c oracle.price -i '{"chain":"base","feed":"0x..."}'
```

---

## 7) NFT marketplace – OpenSea (read API)

```bash
chain-skills -c opensea.collection -i '{"slug":"doodles-official"}'
chain-skills -c opensea.asset -i '{"chain":"base","contract":"0x...","tokenId":"1"}'
```

---

## Wallet execution requirement (important)
- BuildAll docs are not a swap frontend. Execute on the user’s real dApp tab.
- For EVM wallet signing, use injected provider JSON-RPC (`window.ethereum.request`) with `eth_sendTransaction` (MetaMask flow per EthSkills guidance).
- Prefer helper commands:
  - `wallet.evm.browserRelayDispatch` (OpenClaw Chrome/Brave relay attached tab)
  - `wallet.evm.browserDispatch` (manual/integration fallback)

## Safety defaults
- Set `"simulate": true` first for every write path.
- Enforce slippage (`amountOutMinimum`) for swaps.
- Ensure token approvals before protocol writes.
- Confirm chain key and addresses before submit.
