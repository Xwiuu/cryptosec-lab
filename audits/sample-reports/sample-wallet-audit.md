# Relatório de Auditoria de Wallet

**Projeto:** Core Chain Wallet  
**Versão Auditada:** v1.0.0  
**Data da Auditoria:** 09 de Junho de 2026  
**Auditor:** CryptoSec Lab  
**Classificação:** Público  

---

## 1. Executive Summary

A CryptoSec Lab realizou uma auditoria de segurança na wallet do **Core Chain**, implementada em Rust nos arquivos `core-chain/src/wallet.rs` e `core-chain/src/crypto.rs`.

Foram identificadas **4 vulnerabilidades**: 1 Crítica, 1 Alta, 1 Média e 1 Baixa. A vulnerabilidade crítica envolve geração de chaves previsível. A vulnerabilidade alta é a ausência de validação BIP39 na seed phrase.

---

## 2. Escopo

| Módulo | Arquivo | Linhas | Funcionalidade |
|--------|---------|--------|----------------|
| wallet | core-chain/src/wallet.rs | 193 | Geração, armazenamento e assinatura |
| crypto | core-chain/src/crypto.rs | 203 | Primitivas criptográficas |
| **Total** | | **~396** | |

---

## 3. Resumo dos Achados

| Severidade | Quantidade |
|------------|-----------|
| **Crítico** | 1 |
| **Alto** | 1 |
| **Médio** | 1 |
| **Baixo** | 1 |
| **Informativo** | 0 |

---

## 4. Achados Detalhados

---

### F-001: Geração de Chaves Previsível

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **CWE** | CWE-338 |
| **Código** | crypto.rs:47-51 |

#### Descrição

A função `generate_keypair()` usa `secure_random_bytes` que utiliza `OsRng` para gerar a chave privada. Embora `OsRng` seja seguro, a wallet também oferece `from_seed()` que aceita uma seed arbitrária sem validação de entropia mínima. Se um usuário ou aplicação fornecer uma seed com baixa entropia, a chave resultante será previsível.

```rust
pub fn generate_keypair() -> (SigningKey, VerifyingKey) {
    let secret = secure_random_bytes::<32>();
    let signing_key = SigningKey::from_bytes(&secret);
    let verifying_key = signing_key.verifying_key();
    (signing_key, verifying_key)
}

pub fn from_seed(seed: &[u8; 32]) -> Self {
    let signing_key = SigningKey::from_bytes(seed);
    // ...
}
```

#### Impacto

- Se a seed tiver entropia insuficiente, um atacante pode bruteforçar a chave privada
- Perda total dos fundos da wallet
- Comprometimento de todas as wallets geradas com seeds fracas

#### Prova de Conceito

```rust
// Seed previsível (32 bytes de zeros):
let weak_seed = [0u8; 32];
let wallet = Wallet::from_seed(&weak_seed);
// Atacante pode calcular a chave pública e verificar transações
```

#### Recomendação

Validar entropia mínima da seed e usar BIP39 com validação de checksum:

```rust
pub fn from_seed(seed: &[u8; 32]) -> Result<Self, BlockchainError> {
    let entropy = seed.iter().map(|b| b.count_ones()).sum::<u32>();
    if entropy < 80 {
        return Err(BlockchainError::LowEntropy);
    }
    // ...
}
```

---

### F-002: Ausência de Validação BIP39 na Seed Phrase

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **CWE** | CWE-345 |
| **Código** | wallet.rs:25-34 |

#### Descrição

A função `from_seed()` aceita um array de 32 bytes como seed, mas não há validação de que esta seed foi derivada corretamente de uma mnemônica BIP39. Seeds que não passam pelo checksum BIP39 podem ser usadas sem aviso.

```rust
pub fn from_seed(seed: &[u8; 32]) -> Self {
    let signing_key = SigningKey::from_bytes(seed);
    let verifying_key = signing_key.verifying_key();
    let address = crypto::generate_address(&verifying_key);
    Wallet {
        signing_key,
        verifying_key,
        address,
    }
}
```

#### Impacto

- Um usuário pode digitar uma seed phrase inválida (com checksum incorreto) e a wallet aceita
- O usuário pode perder acesso aos fundos se a seed não for padrão BIP39
- Impossibilidade de recuperar a wallet em outras carteiras (MetaMask, Ledger, etc.)

#### Recomendação

Implementar validação BIP39:

```rust
pub fn from_mnemonic(mnemonic: &str) -> Result<Self, BlockchainError> {
    // Validar BIP39 checksum
    let mnemonic = Mnemonic::from_str(mnemonic)
        .map_err(|_| BlockchainError::InvalidMnemonic)?;
    let seed = mnemonic.to_seed("");
    let (signing_key, _) = crypto::generate_keypair_from_seed(&seed);
    // ...
}
```

---

### F-003: Ausência de Suporte a Hardware Wallet

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Baixo** |
| **Status** | Aberto |
| **CWE** | CWE-1104 |
| **Código** | wallet.rs (geral) |

#### Descrição

A wallet é puramente software (software wallet). Não há suporte a hardware wallets (Ledger, Trezor) ou HSM (Hardware Security Module). As chaves privadas residem na memória do processo.

#### Impacto

- Chaves privadas vulneráveis a malware que acessa a memória do processo
- Sem proteção física para transações de alto valor
- Sem isolamento de chaves (hot wallet não segura para grandes valores)

#### Recomendação

Adicionar suporte a hardware wallets via protocolo:

```rust
pub fn sign_with_ledger(tx: &mut Transaction) -> Result<(), BlockchainError> {
    // Usar Ledger SDK para assinar sem expor a chave
}
```

---

### F-004: Ausência de Checksum EIP-55 na Exibição de Endereços

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Médio** |
| **Status** | Aberto |
| **CWE** | CWE-20 |
| **Código** | crypto.rs:62-72 |

#### Descrição

O endereço gerado usa Base58 (similar ao Bitcoin), mas não implementa checksum na exibição do endereço ou validação visual EIP-55. Erros de digitação no endereço podem resultar em perda de fundos.

```rust
pub fn generate_address(public_key: &VerifyingKey) -> String {
    let pub_bytes = public_key.as_bytes();
    let hash = hash_sha256(pub_bytes);
    let hash2 = hash_sha256(&hash);
    let mut addr_bytes = [0u8; 25];
    addr_bytes[0] = 0x00;
    addr_bytes[1..21].copy_from_slice(&hash2[..20]);
    let checksum = hash_sha256(&addr_bytes[..21])[..4].to_vec();
    addr_bytes[21..25].copy_from_slice(&checksum);
    bs58::encode(&addr_bytes[..25]).into_string()
}
```

#### Impacto

- Um caractere errado no endereço de destino resulta em perda permanente dos fundos
- Sem detecção de erros de digitação comuns
- Ataques de "address poisoning" podem ter mais sucesso

#### Recomendação

Implementar formatação com checksum visual:

```rust
pub fn format_address(address: &str) -> String {
    // Adicionar checksum via algoritmo similar ao EIP-55
    // Exibir com prefixo e agrupamento para facilitar verificação
    format!("0x{}", address)
}
```

---

## 5. Recomendações Prioritárias

| Prioridade | Recomendação | Achados |
|------------|-------------|---------|
| P-01 | Validar entropia mínima da seed e usar BIP39 | F-001, F-002 |
| P-02 | Implementar criptografia em repouso mais forte | F-003 |
| P-03 | Adicionar checksum visual em endereços | F-004 |
| P-04 | Considerar suporte a hardware wallets | F-003 |

---

## 6. Referências

- [CWE-338: Use of Cryptographically Weak Pseudo-Random Number Generator](https://cwe.mitre.org/data/definitions/338.html)
- [BIP39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP32: Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [EIP-55: Mixed-case checksum address encoding](https://eips.ethereum.org/EIPS/eip-55)
- [Ledger Hardware Wallet Security Model](https://www.ledger.com/security)

---

**CryptoSec Lab**  
Contato: security@cryptoseclab.com
