# Wallet Security

## Boas Praticas

### Geracao de Chaves
- Usar RNG criptograficamente seguro (OsRng)
- Gerar seed phrase com entropia suficiente (128+ bits)
- Nunca usar seeds pre-determinadas

### Armazenamento
- Private key cifrada com password forte
- Backup offline da seed phrase
- Hardware wallet para valores significativos
- NUNCA armazenar private key em texto puro

### Operacao
- Verificar endereco completo (nao so primeiros/ultimos chars)
- Confirmar amount antes de assinar
- Verificar chain_id antes de enviar transacao
- Usar nonce tracking para evitar replay

## Ataques Comuns

- **Phishing**: Sites falsos que roubam seed phrase
- **Clipboard Hijacking**: Malware que substitui endereco copiado
- **Malicious dApps**: dApps que drenam allowance
- **Supply Chain**: Wallet compromise via dependencias

## Implementacao em core-chain

```rust
// Wallet generation
let wallet = Wallet::generate();

// Encrypt private key with password
let encrypted = wallet.encrypt_private_key("password");

// Decrypt and recover
let decrypted = Wallet::decrypt_private_key(&encrypted, "password").unwrap();
let recovered = Wallet::from_private_key_bytes(&decrypted).unwrap();
```
