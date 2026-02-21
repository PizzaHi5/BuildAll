# Hedera Skill

## Core capabilities
- Account + token reads: `hedera.account`, `hedera.token`, `hedera.hts.tokenInfo`
- Consensus topic messages (HCS): `hedera.hcs.messages`
- USDC token metadata: `hedera.usdc.info`
- EVM smart-contract call/send (Hedera Smart Contract Service):
  - `hedera.evm.call`
  - `hedera.evm.sendRaw`

## Functional mapping
- **Token issuance (native):** Hedera Token Service (HTS) via token APIs/SDK flows
- **Consensus logging:** Hedera Consensus Service (HCS)
- **Stablecoin (fiat-backed):** USD Coin metadata/support on Hedera
- **Smart contracts (EVM):** HSC via JSON-RPC

## Notes
- Native HTS/HCS writes are generally performed with Hedera SDK signed tx flows.
- EVM-compatible writes can be relayed with `hedera.evm.sendRaw`.
