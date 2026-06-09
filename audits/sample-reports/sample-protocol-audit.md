# Relatório de Auditoria de Protocolo Blockchain

**Projeto:** Vulnerable Chain Protocol  
**Versão Auditada:** v1.0.0  
**Data da Auditoria:** 09 de Junho de 2026  
**Auditor:** CryptoSec Lab  
**Classificação:** Público  

---

## 1. Executive Summary

A CryptoSec Lab realizou uma auditoria de segurança no **Vulnerable Chain Protocol**, uma implementação educacional de blockchain em Rust que demonstra diversas vulnerabilidades de protocolo. Os módulos auditados estão em `vulnerable-chain/src/`.

Foram identificadas **5 vulnerabilidades**: 2 Críticas, 2 Altas e 1 Média. As vulnerabilidades críticas incluem o uso de algoritmos de hash fracos (MD5/SHA-1) para hashing de blocos e a ausência de validação de dificuldade de mineração, permitindo que blocos sejam minerados instantaneamente sem custo computacional.

---

## 2. Escopo

| Módulo | Arquivo | Linhas | Funcionalidade |
|--------|---------|--------|----------------|
| weak_hash | vulnerable-chain/src/weak_hash.rs | 68 | Algoritmos de hash para blocos |
| difficulty_bypass | vulnerable-chain/src/difficulty_bypass.rs | 107 | Mineração e validação de dificuldade |
| replay_attack | vulnerable-chain/src/replay_attack.rs | 115 | Assinatura de transações |
| double_spend | vulnerable-chain/src/double_spend.rs | 87 | Processamento de transações e nonce |
| timestamp_manipulation | vulnerable-chain/src/timestamp_manipulation.rs | 87 | Validação de timestamp de blocos |
| **Total** | | **~464** | |

---

## 3. Resumo dos Achados

| Severidade | Quantidade |
|------------|-----------|
| **Crítico** | 2 |
| **Alto** | 2 |
| **Médio** | 1 |
| **Baixo** | 0 |
| **Informativo** | 0 |

---

## 4. Achados Detalhados

---

### F-001: Algoritmo de Hash Fraco para Blocos

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **CWE** | CWE-328 |
| **Código** | weak_hash.rs:14-23 |

#### Descrição

O protocolo utiliza MD5 e SHA-1 como algoritmos de hash para blocos. MD5 possui resistência a colisões quebrada (2^18 operações para encontrar colisão), e SHA-1 possui o ataque SHAtored (reduzido de 2^69 para 2^61 operações).

```rust
pub fn weak_hash_md5(data: &[u8]) -> String {
    let hash = md5::compute(data);
    format!("{:x}", hash)
}

pub fn weak_hash_sha1(data: &[u8]) -> String {
    use sha1::Digest as _;
    let hash = sha1::Sha1::digest(data);
    format!("{:x}", hash)
}
```

#### Impacto

- Um atacante pode criar um bloco malicioso com o mesmo hash de um bloco válido
- Quebra da integridade da blockchain
- Possibilidade de reescrever o histórico de transações
- Perda de confiança no protocolo

#### Prova de Conceito

```rust
// Um atacante pode encontrar dois blocos com mesmo hash MD5:
let data1 = b"legitimate_block";
let data2 = b"malicious_block";
// Com ~2^18 tentativas, encontra-se colisão MD5
```

#### Recomendação

Substituir por SHA-256 ou Blake3:

```rust
pub fn strong_hash_sha256(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}
```

---

### F-002: Bypass de Dificuldade de Mineração

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **CWE** | CWE-807 |
| **Código** | difficulty_bypass.rs:18-31 |

#### Descrição

O método `vulnerable_mine()` permite que o minerador defina a dificuldade como 0, o que torna a mineração instantânea (hash target = string vazia). Qualquer hash é válido.

```rust
pub fn vulnerable_mine(&mut self) {
    let target = "0".repeat(self.difficulty as usize);
    let mut nonce = 0u64;
    loop {
        let input = format!("{}:{}:{}", self.index, self.data, nonce);
        let hash = format!("{:x}", md5::compute(input.as_bytes()));
        if hash.starts_with(&target) {
            self.hash = hash;
            return;
        }
        nonce += 1;
    }
}
```

#### Impacto

- Blocos podem ser minerados instantaneamente sem custo computacional
- Atacante pode inundar a chain com blocos maliciosos
- Possibilidade de reescrever o histórico da blockchain (51% attack simplificado)
- Destruição do mecanismo de consenso

#### Prova de Conceito

```rust
let mut block = VulnerableBlock {
    index: 0,
    data: "evil_block".to_string(),
    hash: String::new(),
    difficulty: 0,  // Dificuldade zero = mineração instantânea
};
block.vulnerable_mine(); // Imediato, sem loop!
```

#### Recomendação

Validar dificuldade mínima e usar hash forte:

```rust
pub fn secure_mine(&mut self) -> bool {
    if self.difficulty == 0 || self.difficulty > MAX_DIFFICULTY {
        return false;
    }
    let target = "0".repeat(self.difficulty as usize);
    // ... SHA-256 mining loop
}
```

---

### F-003: Ausência de Chain ID em Transações (Replay)

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **CWE** | CWE-345 |
| **Código** | replay_attack.rs:22-48 |

#### Descrição

O hash da transação não inclui o `chain_id`. Uma transação assinada na chain A pode ser reutilizada na chain B (por exemplo, após um hard fork).

```rust
fn calculate_hash(&self) -> String {
    let data = format!("{}:{}:{}:{}", self.from, self.to, self.amount, self.nonce);
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    hex::encode(hasher.finalize())
}
```

#### Impacto

- Transação válida na chain principal também é válida em forks
- Double spending cross-chain
- Perda financeira para usuários e exchanges

#### Prova de Conceito

```rust
// Duas chains diferentes produzem o mesmo hash de transação:
let tx_a = VulnerableTransaction::new("alice", "bob", 100, 0);
let tx_b = VulnerableTransaction::new("alice", "bob", 100, 0);
assert_eq!(tx_a.tx_hash, tx_b.tx_hash); // Mesmo hash!
```

#### Recomendação

```rust
fn calculate_hash(&self) -> String {
    let data = format!(
        "{}:{}:{}:{}:{}",
        self.from, self.to, self.amount, self.nonce, self.chain_id
    );
    // ...
}
```

---

### F-004: Double Spend por Ausência de Nonce

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **CWE** | CWE-840 |
| **Código** | double_spend.rs:14-23 |

#### Descrição

O processamento de transações não verifica nonce. O mesmo saldo pode ser gasto múltiplas vezes se a transação for replicada para diferentes nós.

```rust
pub fn process_transaction(&mut self, amount: u64) -> bool {
    if amount > self.balance {
        return false;
    }
    self.balance -= amount;
    true
}
```

#### Impacto

- Um atacante pode gastar o mesmo saldo várias vezes
- Duas transações concorrentes com mesmo saldo podem ser aceitas por diferentes nós
- Destruição do modelo de conta

#### Prova de Conceito

```rust
let mut account = VulnerableAccountState { balance: 100 };
account.process_transaction(100); // Gasta 100
account.balance = 100;           // Reset manual (simula race condition)
account.process_transaction(100); // Gasta novamente!
```

#### Recomendação

```rust
pub fn process_transaction(&mut self, amount: u64, nonce: u64) -> Result<(), &'static str> {
    if nonce != self.nonce {
        return Err("Invalid nonce");
    }
    if amount > self.balance {
        return Err("Insufficient balance");
    }
    self.balance -= amount;
    self.nonce += 1;
    Ok(())
}
```

---

### F-005: Manipulação de Timestamp de Blocos

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Médio** |
| **Status** | Aberto |
| **CWE** | CWE-20 |
| **Código** | timestamp_manipulation.rs:19-27 |

#### Descrição

O construtor de `VulnerableBlock` aceita qualquer timestamp, incluindo timestamps futuros ou extremamente antigos, sem validação.

```rust
pub fn new(index: u64, timestamp: u64, data: &str) -> Self {
    VulnerableBlock {
        index,
        timestamp,
        data: data.to_string(),
    }
}
```

#### Impacto

- Timestamps futuros podem reduzir a dificuldade de mineração prematuramente
- Timestamps passados podem reordenar blocos na chain
- Manipulação do cálculo de dificuldade em PoW/PoS

#### Prova de Conceito

```rust
let future = 999_999_999_999; // Timestamp absurdo no futuro
let block = VulnerableBlock::new(0, future, "data");
assert_eq!(block.timestamp, future); // Aceito sem validação!
```

#### Recomendação

```rust
pub fn validate_timestamp(&self, previous_timestamp: u64, now: u64) -> bool {
    let max_future = 7200; // 2 horas no futuro
    self.timestamp > previous_timestamp && self.timestamp <= now + max_future
}
```

---

## 5. Recomendações Prioritárias

| Prioridade | Recomendação | Achados |
|------------|-------------|---------|
| P-01 | Substituir MD5/SHA-1 por SHA-256 ou Blake3 | F-001 |
| P-02 | Validar dificuldade mínima > 0 | F-002 |
| P-03 | Adicionar chain_id no hash da transação | F-003 |
| P-04 | Implementar nonce tracking no processamento | F-004 |
| P-05 | Validar timestamp com janela máxima | F-005 |

---

## 6. Referências

- CWE-328: Use of Weak Hash
- CWE-807: Reliance on Untrusted Inputs
- CWE-345: Insufficient Verification of Data Authenticity
- CWE-840: Business Logic Errors
- CWE-20: Improper Input Validation
- [Bitcoin Difficulty Adjustment](https://en.bitcoin.it/wiki/Difficulty)
- [Ethereum Chain ID Replay Protection (EIP-155)](https://eips.ethereum.org/EIPS/eip-155)

---

**CryptoSec Lab**  
Contato: security@cryptoseclab.com
