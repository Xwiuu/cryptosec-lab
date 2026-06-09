# Wallet Security Checklist

## Key Generation
- [ ] CSRNG used for key generation
- [ ] Seed phrase generated with sufficient entropy
- [ ] BIP-39 compliant mnemonic
- [ ] Key derivation follows standard (BIP-32)

## Storage
- [ ] Private key encrypted at rest
- [ ] No plaintext key in logs/memory dumps
- [ ] Secure enclave / hardware wallet support
- [ ] Backup/recovery mechanism documented

## Signing
- [ ] Transaction signing requires explicit user approval
- [ ] No blind signing
- [ ] Domain/chain verification before signing
- [ ] Nonce management to prevent replay

## UX Security
- [ ] Address verification (checksum)
- [ ] Phishing protection warnings
- [ ] Clear fee display before confirmation
- [ ] Session timeout for inactivity

## Network
- [ ] Connection to trusted nodes only
- [ ] TLS for RPC connections
- [ ] No private key transmission over network
- [ ] DNS劫持 protection
