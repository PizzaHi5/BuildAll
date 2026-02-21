import { SkillException, withTiming } from '@chain-skills/core';

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
