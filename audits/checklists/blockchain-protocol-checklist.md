# Blockchain Protocol Security Checklist

## Consensus
- [ ] PoW: Difficulty adjustment implemented
- [ ] PoS: Validator selection is fair
- [ ] Fork choice rule is clearly defined
- [ ] Long-range attack protection (PoS)
- [ ] Nothing-at-stake protection (PoS)

## Chain Validation
- [ ] Genesis block is deterministic
- [ ] Each block validates previous_hash
- [ ] Block hash meets difficulty target
- [ ] Chain integrity verified on sync
- [ ] Timestamp bounds enforced

## Transaction Validation
- [ ] Signatures required and verified
- [ ] Nonce tracking prevents double spend
- [ ] Chain_id prevents replay
- [ ] Balance check before transfer
- [ ] Minimum fee enforced
- [ ] Amount > 0 for non-coinbase

## Mempool
- [ ] Duplicate transaction detection
- [ ] Rate limiting per address
- [ ] Maximum pool size
- [ ] Fee-based ordering
- [ ] Spam protection

## Network
- [ ] Sybil resistance
- [ ] Eclipse attack protection
- [ ] DoS protection on RPC
- [ ] Rate limiting on API
- [ ] Peer identity verification

## Key Management
- [ ] Private keys never logged
- [ ] No private key exposure via API
- [ ] Seed generation with secure RNG
- [ ] Key encryption at rest
