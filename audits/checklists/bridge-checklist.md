# Bridge Security Checklist

## Message Format
- [ ] Chain ID included in message hash
- [ ] Domain separator (EIP-712)
- [ ] Nonce per message
- [ ] Sender/receiver addresses
- [ ] Token address and amount
- [ ] Timestamp or block number

## Replay Protection
- [ ] Processed messages mapping (bytes32 => bool)
- [ ] Nonce increment per lock
- [ ] Chain ID validation
- [ ] Domain separator verification
- [ ] Signature replay prevention

## Validator System
- [ ] Minimum validator threshold >= 2
- [ ] No single point of failure
- [ ] Validator set management with timelock
- [ ] Validator key rotation procedure
- [ ] Signature verification (ecrecover)
- [ ] Duplicate signer check

## Rate Limiting
- [ ] Max amount per time period
- [ ] Max amount per transaction
- [ ] Global daily limit
- [ ] Per-user limit

## Emergency
- [ ] Pause/unpause mechanism
- [ ] Emergency shutdown
- [ ] Recovery procedure
- [ ] Monitoring and alerts

## Economic Security
- [ ] Total value locked vs validator bond
- [ ] Incentive alignment
- [ ] Slashing conditions
- [ ] Insurance fund

## Upgradeability
- [ ] Timelock on contract upgrades
- [ ] Multisig governance
- [ ] Storage layout compatibility
- [ ] Proxy pattern security
