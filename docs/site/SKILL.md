# BuildAll Skills Index (Agent Entry)

Fetch this first.

This index routes agents to focused markdown skill pages for major onchain actions.

## All skills
- `https://pizzahi5.github.io/BuildAll/SKILL.md`

## Individual skill pages
- `https://pizzahi5.github.io/BuildAll/ship/SKILL.md` — End-to-end execution flow
- `https://pizzahi5.github.io/BuildAll/erc20/SKILL.md` — ERC-20 token operations
- `https://pizzahi5.github.io/BuildAll/erc721/SKILL.md` — ERC-721 NFT operations
- `https://pizzahi5.github.io/BuildAll/dex/SKILL.md` — DEX (Uniswap v3) quote/swap/pool state
- `https://pizzahi5.github.io/BuildAll/lending/SKILL.md` — Lending (Aave v3)
- `https://pizzahi5.github.io/BuildAll/stablecoin/SKILL.md` — Stablecoin (Maker vault baseline)
- `https://pizzahi5.github.io/BuildAll/oracle/SKILL.md` — Oracle (Chainlink feeds)
- `https://pizzahi5.github.io/BuildAll/nft-marketplace/SKILL.md` — NFT marketplace (OpenSea reads)
- `https://pizzahi5.github.io/BuildAll/addresses/SKILL.md` — Canonical addresses/chains keys

## Chain keys
- `ethereum`
- `base`
- `arbitrum`
- `optimism`
- `polygon`

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
