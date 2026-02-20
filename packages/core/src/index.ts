import { config as loadDotEnv } from 'dotenv';

loadDotEnv();

export type SkillErrorCode =
  | 'INVALID_INPUT'
  | 'RPC_ERROR'
  | 'TX_FAILED'
  | 'TIMEOUT'
  | 'UNSUPPORTED_CHAIN'
  | 'STALE_ORACLE_DATA'
  | 'NOT_IMPLEMENTED_WRITE'
  | 'UNKNOWN_ERROR';

export interface SkillError {
  code: SkillErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export interface SkillMeta {
  chain: string;
  network: string;
  blockNumber?: bigint;
  txHash?: `0x${string}`;
  simulated: boolean;
  latencyMs: number;
}

export interface SkillResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: SkillError;
  meta: SkillMeta;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorer?: string;
  usdc?: `0x${string}`;
}

export interface AppConfig {
  chains: Record<string, ChainConfig>;
  maxGasLimit: bigint;
  oracleMaxStalenessSec: number;
  rpcTimeoutMs: number;
  retryCount: number;
  privateKey?: `0x${string}`;
}

const envBigint = (v: string | undefined, fallback: bigint): bigint => {
  if (!v) return fallback;
  return BigInt(v);
};

const envNum = (v: string | undefined, fallback: number): number => {
  if (!v) return fallback;
  return Number(v);
};

export const loadConfig = (): AppConfig => ({
  chains: {
    ethereum: {
      chainId: 1,
      name: 'Ethereum',
      rpcUrl: process.env.ETHEREUM_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
      usdc:
        (process.env.ETHEREUM_USDC_ADDRESS as `0x${string}` | undefined) ??
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    base: {
      chainId: 8453,
      name: 'Base',
      rpcUrl: process.env.BASE_RPC_URL ?? 'https://base-rpc.publicnode.com',
      usdc:
        (process.env.BASE_USDC_ADDRESS as `0x${string}` | undefined) ??
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    },
    arbitrum: {
      chainId: 42161,
      name: 'Arbitrum',
      rpcUrl: process.env.ARBITRUM_RPC_URL ?? 'https://arbitrum-one-rpc.publicnode.com',
      usdc:
        (process.env.ARBITRUM_USDC_ADDRESS as `0x${string}` | undefined) ??
        '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    },
    optimism: {
      chainId: 10,
      name: 'Optimism',
      rpcUrl: process.env.OPTIMISM_RPC_URL ?? 'https://optimism-rpc.publicnode.com',
      usdc:
        (process.env.OPTIMISM_USDC_ADDRESS as `0x${string}` | undefined) ??
        '0x0b2C639c533813f4Aa9D7837CaF62653d097FF85'
    },
    polygon: {
      chainId: 137,
      name: 'Polygon',
      rpcUrl: process.env.POLYGON_RPC_URL ?? 'https://polygon-bor-rpc.publicnode.com',
      usdc:
        (process.env.POLYGON_USDC_ADDRESS as `0x${string}` | undefined) ??
        '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'
    }
  },
  maxGasLimit: envBigint(process.env.MAX_GAS_LIMIT, 1_200_000n),
  oracleMaxStalenessSec: envNum(process.env.ORACLE_MAX_STALENESS_SEC, 3600),
  rpcTimeoutMs: envNum(process.env.RPC_TIMEOUT_MS, 15_000),
  retryCount: envNum(process.env.RPC_RETRY_COUNT, 2),
  privateKey: process.env.EVM_PRIVATE_KEY as `0x${string}` | undefined
});

export class SkillException extends Error {
  constructor(public readonly code: SkillErrorCode, message: string, public readonly details?: Record<string, unknown>) {
    super(message);
  }
}

export const nowMs = (): number => Date.now();

export const okResult = <T>(meta: SkillMeta, data: T): SkillResult<T> => ({ ok: true, data, meta });

export const errResult = <T = unknown>(meta: SkillMeta, error: SkillError): SkillResult<T> => ({ ok: false, error, meta });

export const withTiming = async <T>(
  chain: string,
  network: string,
  simulated: boolean,
  fn: () => Promise<{ data: T; txHash?: `0x${string}`; blockNumber?: bigint }>
): Promise<SkillResult<T>> => {
  const started = nowMs();
  try {
    const result = await fn();
    return okResult(
      {
        chain,
        network,
        blockNumber: result.blockNumber,
        txHash: result.txHash,
        simulated,
        latencyMs: nowMs() - started
      },
      result.data
    );
  } catch (e) {
    const err = e as SkillException;
    return errResult<T>(
      { chain, network, simulated, latencyMs: nowMs() - started },
      {
        code: err.code ?? 'UNKNOWN_ERROR',
        message: err.message,
        details: err.details
      }
    );
  }
};
