import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: { environment: 'node' },
  resolve: {
    alias: {
      '@chain-skills/core': resolve(__dirname, 'packages/core/src/index.ts'),
      '@chain-skills/evm': resolve(__dirname, 'packages/evm/src/index.ts'),
      '@chain-skills/skills': resolve(__dirname, 'packages/skills/src/index.ts'),
      '@chain-skills/protocols/erc20': resolve(__dirname, 'packages/protocols/src/erc20/index.ts'),
      '@chain-skills/protocols/erc721': resolve(__dirname, 'packages/protocols/src/erc721/index.ts'),
      '@chain-skills/protocols/chainlink': resolve(__dirname, 'packages/protocols/src/chainlink/index.ts'),
      '@chain-skills/protocols/uniswap-v3': resolve(__dirname, 'packages/protocols/src/uniswap-v3/index.ts'),
      '@chain-skills/protocols/uniswap-v4': resolve(__dirname, 'packages/protocols/src/uniswap-v4/index.ts')
    }
  }
});
