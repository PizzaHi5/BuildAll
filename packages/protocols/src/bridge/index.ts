import { browserWalletConfirmationPlan, SkillException, withTiming } from '@chain-skills/core';

export type BridgeProtocol = 'wormhole' | 'allbridge';

export interface BridgeChainRegistry {
  chain: string;
  wormhole?: {
    core?: string;
    tokenBridge?: string;
    relayer?: string;
    quoterRouter?: string;
  };
  allbridge?: {
    bridge?: string;
    notes?: string;
  };
  ibc?: {
    transferPort?: string;
    notes?: string;
  };
}

export const BRIDGE_REGISTRY_MAINNET: Record<string, BridgeChainRegistry> = {
  ethereum: {
    chain: 'ethereum',
    wormhole: {
      core: '0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B',
      tokenBridge: '0x3ee18B2214AFF97000D974cf647E7C347E8fa585',
      relayer: '0x27428DD2d3DD32A4D7f7C497eAaa23130d894911',
      quoterRouter: '0xF22F1c0A3a8Cb42F695601731974784C499C4EF3'
    }
  },
  base: {
    chain: 'base',
    wormhole: {
      core: '0xbebdb6C8ddC678FfA9f8748f85C815C556Dd8ac6',
      tokenBridge: '0x8d2de8d2f73F1F4cAB472AC9A881C9b123C79627',
      relayer: '0x706f82e9bb5b0813501714ab5974216704980e31',
      quoterRouter: '0x265fd0500a430d65d6D79Cd8707F24C048604658'
    }
  },
  arbitrum: {
    chain: 'arbitrum',
    wormhole: {
      core: '0xa5f208e072434bC67592E4C49C1B991BA79BCA46',
      tokenBridge: '0x0b2402144Bb366A632D14B83F244D2e0e21bD39c',
      relayer: '0x27428DD2d3DD32A4D7f7C497eAaa23130d894911',
      quoterRouter: '0x32eec14c963c23176bd8951f192292006756bDcC'
    }
  },
  optimism: {
    chain: 'optimism',
    wormhole: {
      core: '0xEe91C335eab126dF5fDB3797EA9d6aD93aeC9722',
      tokenBridge: '0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b',
      relayer: '0x27428DD2d3DD32A4D7f7C497eAaa23130d894911',
      quoterRouter: '0xa3B6551cCbB5Fe1dc33b71EE3590B1Df22ae75B3'
    }
  },
  polygon: {
    chain: 'polygon',
    wormhole: {
      core: '0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7',
      tokenBridge: '0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE',
      relayer: '0x27428DD2d3DD32A4D7f7C497eAaa23130d894911',
      quoterRouter: '0x2a856931603930B827B1A4352FB4D66fA029F123'
    }
  },
  injective: {
    chain: 'injective',
    wormhole: {
      core: 'inj17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9l2q74d',
      tokenBridge: 'inj1ghd753shjuwexxywmgs4xz7x2q732vcnxxynfn'
    },
    ibc: {
      transferPort: 'transfer',
      notes: 'IBC channel/route depends on destination chain and relayer path.'
    }
  },
  near: {
    chain: 'near',
    wormhole: {
      core: 'contract.wormhole_crypto.near',
      tokenBridge: 'contract.portalbridge.near'
    }
  },
  hedera: {
    chain: 'hedera',
    ibc: {
      notes: 'IBC not applicable. Use Wormhole/Allbridge/CEX fallback per route availability.'
    }
  },
  solana: {
    chain: 'solana',
    wormhole: {
      core: 'worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth',
      tokenBridge: 'wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb'
    },
    allbridge: {
      bridge: 'bb1XfNoER5QC3rhVDaVz3AJp9oFKoHNHG6PHfZLcCjj',
      notes: 'Allbridge Classic Solana bridge account from official allbridge-contract-docs README.'
    }
  }
};

const EVM_CHAINS = new Set(['ethereum', 'base', 'arbitrum', 'optimism', 'polygon']);

export const bridgeRegistry = async (input: { chain?: string }) =>
  withTiming<{ chain?: BridgeChainRegistry; chains?: Record<string, BridgeChainRegistry> }>('multi', 'BridgeRegistry', true, async () => {
    if (input.chain) {
      const chain = BRIDGE_REGISTRY_MAINNET[input.chain];
      if (!chain) throw new SkillException('UNSUPPORTED_CHAIN', `No bridge registry entry for chain ${input.chain}`);
      return { data: { chain } };
    }
    return { data: { chains: BRIDGE_REGISTRY_MAINNET } };
  });

export const bridgeValidateAddress = async (input: {
  protocol: BridgeProtocol;
  chain: string;
  contractType: string;
  address: string;
}) =>
  withTiming(input.chain, 'BridgeRegistry', true, async () => {
    const chain = BRIDGE_REGISTRY_MAINNET[input.chain];
    if (!chain) throw new SkillException('UNSUPPORTED_CHAIN', `No bridge registry entry for chain ${input.chain}`);

    const namespace = chain[input.protocol];
    if (!namespace) throw new SkillException('INVALID_INPUT', `No ${input.protocol} registry entry for ${input.chain}`);

    const expected = (namespace as Record<string, string | undefined>)[input.contractType];
    if (!expected) {
      throw new SkillException('INVALID_INPUT', `No ${input.protocol}.${input.contractType} registry entry for ${input.chain}`);
    }

    const isMatch = expected.toLowerCase() === input.address.toLowerCase();
    if (!isMatch) {
      throw new SkillException('INVALID_INPUT', 'Unverified bridge target address', {
        protocol: input.protocol,
        chain: input.chain,
        contractType: input.contractType,
        provided: input.address,
        expected
      });
    }

    return {
      data: {
        verified: true,
        protocol: input.protocol,
        chain: input.chain,
        contractType: input.contractType,
        address: input.address
      }
    };
  });

export const bridgePreflight = async (input: {
  sourceChain: string;
  destinationChain: string;
  sourceToken?: string;
  destinationToken?: string;
  preferredProtocols?: BridgeProtocol[];
}) =>
  withTiming('multi', 'BridgePreflight', true, async () => {
    const source = BRIDGE_REGISTRY_MAINNET[input.sourceChain];
    const destination = BRIDGE_REGISTRY_MAINNET[input.destinationChain];

    if (!source) throw new SkillException('UNSUPPORTED_CHAIN', `Unsupported source chain: ${input.sourceChain}`);
    if (!destination) throw new SkillException('UNSUPPORTED_CHAIN', `Unsupported destination chain: ${input.destinationChain}`);
    if (input.sourceChain === input.destinationChain) {
      throw new SkillException('INVALID_INPUT', 'Source and destination chains must differ for bridging');
    }

    const preferred: BridgeProtocol[] = input.preferredProtocols?.length ? input.preferredProtocols : ['wormhole', 'allbridge'];
    const routeCandidates: Array<{
      protocol: BridgeProtocol;
      compatible: boolean;
      reason?: string;
      sourceTargets?: Record<string, string | undefined>;
      destinationTargets?: Record<string, string | undefined>;
    }> = [];

    for (const protocol of preferred) {
      const s = (protocol === 'wormhole' ? source.wormhole : source.allbridge) as Record<string, string | undefined> | undefined;
      const d = (protocol === 'wormhole' ? destination.wormhole : destination.allbridge) as
        | Record<string, string | undefined>
        | undefined;
      if (!s || !d) {
        routeCandidates.push({
          protocol,
          compatible: false,
          reason: `Missing ${protocol} registry entries on one or both chains`
        });
        continue;
      }

      const hasCoreRoute = Boolean(
        (s.tokenBridge || s.bridge || s.core) && (d.tokenBridge || d.bridge || d.core)
      );

      routeCandidates.push({
        protocol,
        compatible: hasCoreRoute,
        reason: hasCoreRoute ? undefined : `No executable ${protocol} route target pair in registry`,
        sourceTargets: s,
        destinationTargets: d
      });
    }

    const compatibleRoutes = routeCandidates.filter((r) => r.compatible);
    const useCoinbaseFallback = compatibleRoutes.length === 0;

    const requiresCexForLikelyPath =
      useCoinbaseFallback ||
      ((EVM_CHAINS.has(input.sourceChain) && input.destinationChain === 'solana') ||
        (input.sourceChain === 'solana' && EVM_CHAINS.has(input.destinationChain))) &&
        !compatibleRoutes.some((r) => r.protocol === 'wormhole' || r.protocol === 'allbridge');

    const actionPlan = useCoinbaseFallback
      ? [
          'Collect Coinbase Advanced Trade API key with Trade, View, Transfer scopes',
          'Create source-asset deposit address and wait for confirmations',
          'Execute market conversion (source asset -> USD -> destination asset)',
          'Withdraw destination asset to target chain wallet',
          'Confirm destination-chain receipt onchain'
        ]
      : [
          'Select best compatible bridge route from routeCandidates',
          'Validate bridge contract/program targets against bridge.registry entries',
          'Approve/prepare source asset transfer to bridge route',
          'Execute bridge transfer and monitor message finality',
          'If required, swap bridged asset into destination target asset',
          'Confirm destination receipt and return completion payload'
        ];

    const walletRoute = browserWalletConfirmationPlan([input.sourceChain, input.destinationChain]);

    return {
      data: {
        sourceChain: input.sourceChain,
        destinationChain: input.destinationChain,
        sourceToken: input.sourceToken,
        destinationToken: input.destinationToken,
        routeCandidates,
        selectedStrategy: useCoinbaseFallback ? 'coinbase-fallback' : 'direct-bridge',
        requiresCoinbaseApiKey: requiresCexForLikelyPath,
        coinbaseRequiredScopes: ['Trade', 'View', 'Transfer'],
        actionPlan,
        walletRoute,
        guardrails: [
          'Always simulate and/or quote first',
          'Reject unverified bridge targets via bridge.validateAddress',
          'Require explicit user confirmation before executing transfers/trades/withdrawals',
          'Require browser-wallet confirmation in each involved chain wallet',
          'Return fees and slippage estimate before execution'
        ]
      }
    };
  });
