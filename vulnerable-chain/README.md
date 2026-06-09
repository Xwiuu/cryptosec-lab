# Vulnerable Chain — CryptoSec Lab

Implementacoes vulneraveis de ataques blockchain para fins educacionais.
Cada vulnerabilidade inclui codigo vulneravel, codigo corrigido, testes e documentacao.

## Aviso Etico

**ESTE MATERIAL E ESTRITAMENTE EDUCACIONAL.**

- Todo codigo vulneravel esta marcado como tal.
- Todos os testes sao simulacoes locais controladas.
- Nao use este codigo contra redes reais, wallets reais ou terceiros.
- O uso indevido e responsabilidade exclusiva do usuario.

## Vulnerabilidades

| Modulo | Impacto | Mitigacao | Testes |
|--------|---------|-----------|--------|
| weak_hash | Colisao de hash, quebra de integridade | SHA-256 / Blake3 | 3 |
| difficulty_bypass | Mineracao sem custo, spam de blocos | Difficulty global da rede | 3 |
| replay_attack | Double spending entre chains | chain_id + nonce no hash | 3 |
| double_spend | Gastar mesmo saldo 2x | Nonce tracking / UTXO | 4 |
| invalid_signature | Roubo de fundos sem chave privada | Verificacao de assinatura obrigatoria | 4 |
| timestamp_manipulation | Reorganizacao da chain, difficulty hack | Validacao de drift e monotonicidade | 3 |
| chain_tampering | Reescrita do historico | previous_hash + validacao completa | 3 |
| mempool_spam | DoS, congestionamento | Fee minima, rate limit, limite de tamanho | 4 |
| overflow_underflow | Mint infinito, quebra de contabilidade | checked_add/checked_sub | 5 |
| fifty_one_percent | Reversao de transacoes, double spend | Confirmacoes, checkpoints, finalidade | 3 |

## Ordem de Estudo Recomendada

1. **Weak hash** — fundamento: integridade dos dados.
2. **Chain tampering** — fundamento: imutabilidade.
3. **Difficulty bypass** — fundamento: consenso PoW.
4. **Invalid signature** — fundamento: propriedade.
5. **Replay** — fundamento: identificacao unica de tx.
6. **Double spend** — fundamento: estado de conta.
7. **Mempool spam** — fundamento: protecao de rede.
8. **Timestamp manipulation** — fundamento: tempo em blockchain.
9. **Overflow/underflow** — fundamento: aritmetica segura.
10. **51%** — fundamento: finalidade e descentralizacao.

## Como Executar

```bash
# Todos os testes da vulnerable-chain
cargo test -p vulnerable-chain

# Teste especifico
cargo test -p vulnerable-chain -- weak_hash

# Todos os testes do workspace
cargo test

# Verificacao de estilo
cargo fmt --all
cargo clippy --all-targets -- -D warnings
```

## Como Comparar com core-chain

Cada modulo tem duas implementacoes:

- **Vulnerable** — versao com a falha de seguranca.
- **Secure** — versao corrigida que segue as praticas do `core-chain`.

Para ver a diferenca, compare:

- `weak_hash_md5()` vs `strong_hash_sha256()` no `core-chain`/`crypto.rs`.
- `VulnerableTransaction` sem chain_id vs `Transaction` no `core-chain`.

Os testes em `core-chain/tests/vulnerability_tests.rs` tambem mostram como o core-chain bloqueia esses ataques.

## Estrutura de Arquivos

```
vulnerable-chain/
  Cargo.toml
  README.md
  src/
    lib.rs                          # Modulo principal com re-exports
    weak_hash.rs                    # MD5/SHA-1 vs SHA-256
    difficulty_bypass.rs            # Difficulty 0 vs regra global
    replay_attack.rs                # Sem chain_id vs com chain_id
    double_spend.rs                 # Sem nonce vs nonce obrigatorio
    invalid_signature.rs            # Sem verificacao vs verificacao
    timestamp_manipulation.rs       # Sem validacao vs validacao de drift
    chain_tampering.rs              # Sem prev_hash vs prev_hash
    mempool_spam.rs                 # Sem limites vs rate limiting
    overflow_underflow.rs           # wrapping vs checked math
    fifty_one_percent.rs            # Chain mais longa vs validacao
```

## Documentacao

Cada vulnerabilidade tem documentacao detalhada em `../exploits/blockchain/`:

- [weak-hash.md](../exploits/blockchain/weak-hash.md)
- [difficulty-bypass.md](../exploits/blockchain/difficulty-bypass.md)
- [replay-attack.md](../exploits/blockchain/replay-attack.md)
- [double-spend.md](../exploits/blockchain/double-spend.md)
- [invalid-signature.md](../exploits/blockchain/invalid-signature.md)
- [timestamp-manipulation.md](../exploits/blockchain/timestamp-manipulation.md)
- [chain-tampering.md](../exploits/blockchain/chain-tampering.md)
- [mempool-spam.md](../exploits/blockchain/mempool-spam.md)
- [overflow-underflow.md](../exploits/blockchain/overflow-underflow.md)
- [fifty-one-percent.md](../exploits/blockchain/fifty-one-percent.md)
