# DEX Skill (Uniswap v3)

## Commands
- `dex.quote` (`protocol: "v3"`)
- `dex.poolState` (`protocol: "v3"`)
- `dex.swap` (`protocol: "v3"`, write)

## Required input patterns
```json
{"protocol":"v3","chain":"arbitrum","tokenIn":"0x...","tokenOut":"0x...","amountIn":"1000000","feeTier":500}
{"protocol":"v3","chain":"base","tokenIn":"0x...","tokenOut":"0x...","amountIn":"1000000","amountOutMinimum":"990000","recipient":"0x...","feeTier":500,"simulate":true}
```

## Notes
- `amountOutMinimum` is mandatory for safe execution.
- Run quote before swap.
