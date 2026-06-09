# NFT Security Checklist

## Minting
- [ ] Supply cap enforced
- [ ] Price/mint fee correct
- [ ] No reentrancy in mint
- [ ] Whitelist/allowlist access controlled

## Metadata
- [ ] Metadata can be frozen
- [ ] TokenURI immutable after reveal
- [ ] No malicious URI injection
- [ ] Metadata storage decentralized (IPFS)

## Marketplace
- [ ] Order signatures validated
- [ ] Replay protection for orders
- [ ] Royalty enforcement (EIP-2981)
- [ ] No fake/burned tokens listing
- [ ] Escrow security

## Transfers
- [ ] SafeTransferFrom for safety checks
- [ ] Approval management
- [ ] No stuck tokens
- [ ] Pause capability for emergencies
