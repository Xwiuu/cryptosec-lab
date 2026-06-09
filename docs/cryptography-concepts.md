# Cryptography Concepts

## Hash Functions

- SHA-256: 32 bytes, usado em Bitcoin e na maioria das blockchains
- Blake3: Mais rapido que SHA-256, usado em algumas chains modernas
- Propriedades: Deterministico, preimage resistant, collision resistant

## Digital Signatures

### Ed25519
- Baseada em Curve25519
- 32 byte private key, 32 byte public key, 64 byte signature
- Mais segura e rapida que ECDSA
- Usada em Solana, Cardano, e muitas chains modernas

### Como funciona
1. Gerar keypair: (sk, pk)
2. Sign: sig = sign(sk, message)
3. Verify: verify(pk, message, sig) -> true/false

## Address Derivation

```
pubkey -> SHA-256 -> SHA-256 -> [20 bytes] + checksum -> Base58 -> Address
```

## Wallet Security

- Private key: NUNCA compartilhar. Generate com CSRNG.
- Seed phrase: 12/24 palavras, backup seguro
- Encrypt: Cifrar private key com password antes de armazenar
