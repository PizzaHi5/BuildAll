# NEAR Skill

## Core capabilities
- Native account/balance: `near.account`, `near.balance`
- NEP-141 token balance: `near.nep141.balance`
- Ref Finance AMM pool reads: `near.ref.pools`
- Burrow lending account reads: `near.burrow.account`
- Paras NFT portfolio reads: `near.paras.tokens`
- Signed tx broadcast: `near.tx.broadcast`

## Notes
- Build/sign NEAR transactions off-chain, then submit via `near.tx.broadcast`.
- For protocol actions (swap/lend/list), generate signed tx via wallet/SDK and broadcast.
