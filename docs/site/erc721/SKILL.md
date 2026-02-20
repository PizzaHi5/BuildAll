# ERC-721 Skill

## Commands
- `nft.ownerOf`
- `nft.balanceOf`
- `nft.tokenUri`
- `nft.transfer` (write)

## Required input patterns
```json
{"chain":"polygon","contract":"0x...","tokenId":"1"}
{"chain":"polygon","contract":"0x...","tokenId":"1","to":"0x...","simulate":true}
```

## Notes
- Prefer `safeTransferFrom` for transfers to contracts.
- `tokenURI` may revert on non-metadata NFTs.
