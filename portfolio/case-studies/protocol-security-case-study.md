# Case Study — Blockchain Protocol-Level Security Review
**Tema:** Replay, Double Spend, Chain Tampering, Difficulty Bypass & Mempool Spam

> [!NOTE]
> **Disclaimer:** Este documento descreve um estudo de caso simulado e executado em ambiente controlado de laboratório (CryptoSec Lab). Não representa um projeto realizado para um cliente real comercial, servindo exclusivamente para demonstrar nossa metodologia de auditoria técnica.

---

## 1. Contexto do Projeto
Muitos consórcios e redes privadas optam por construir blockchains customizadas (L1s/L2s específicas) para atender a demandas de privacidade ou performance. No entanto, criar regras de consenso e validação de transações do zero introduz riscos fundamentais de protocolo que podem permitir gasto duplo de moedas, bifurcações arbitrárias da rede e travamento de nós através de ataques de negação de serviço (DoS) no mempool.

## 2. Escopo da Auditoria
*   **Componentes Auditados:** Lógica de consenso Proof of Work / Proof of Stake, validação de transações assinadas, gerenciamento do mempool e persistência física da blockchain.
*   **Tecnologia:** Implementação em Rust (CryptoSec Core Chain).
*   **Ferramentas Utilizadas:** Testes Unitários de Integração Rust (`cargo test`), Auditoria de Código Fonte da Criptografia (ECDSA secp256k1) e Máquina de Estados.

## 3. Metodologia
Nossa análise focou na robustez do consenso distribuído e na integridade de dados:
1.  **Auditoria de Regras de Consenso:** Avaliação das equações de ajuste de dificuldade de blocos e regras de seleção de validadores.
2.  **Verificação de Gastos e Balanço:** Testar o motor de transações para verificar se saldos negativos são bloqueados e se a mesma transação pode ser reprocessada.
3.  **Simulação de Spam no Mempool:** Criação de scripts para inundar a rede com transações baratas/inválidas e testar a resiliência de memória dos nós.

## 4. Findings (Achados de Segurança)

### Achado 1: Gasto Duplo de Transação (Gravidade: Crítica)
*   **Descrição:** O nó aceitava transações sem verificar adequadamente se o saldo de saída do remetente era deduzido antes do processamento paralelo de transações subsequentes, permitindo gastar o mesmo saldo mais de uma vez.
*   **Localização:** `vulnerable-chain/src/double_spend.rs`

### Achado 2: Ignorância de Assinatura Transacional (Gravidade: Crítica)
*   **Descrição:** Devido a um erro de configuração de depuração deixado ativo, o validador de transações aceitava transações com assinaturas vazias ou inválidas se o remetente fosse o endereço do criador do nó.
*   **Localização:** `vulnerable-chain/src/invalid_signature.rs`

### Achado 3: Desvio de Dificuldade de Mineração (Gravidade: Alta)
*   **Descrição:** Um atacante podia enviar blocos afirmando que a dificuldade de mineração exigida era zero, e o nó aceitava o bloco sem validar a regra de ajuste de dificuldade real da rede, forçando bifurcações artificiais com baixo poder computacional.
*   **Localização:** `vulnerable-chain/src/difficulty_bypass.rs`

### Achado 4: Spam Ilimitado no Mempool (Gravidade: Alta)
*   **Descrição:** O mempool não possuía regras de taxa mínima de transação (gas fees) proporcionais ao tamanho do payload, permitindo que um atacante preenchesse a memória do nó com milhões de transações de taxa zero até exaurir a memória RAM (DoS).
*   **Localização:** `vulnerable-chain/src/mempool_spam.rs`

---

## 5. Exploit Simulation (Prova de Conceito)
No laboratório Rust, validamos as falhas executando testes unitários específicos em ambiente isolado. Por exemplo, simulamos o gasto duplo inserindo duas transações com a mesma assinatura e saldo de saída limite no mesmo bloco candidato.

```rust
#[test]
fn test_vulnerable_double_spend_possible() {
    let mut chain = VulnerableBlockchain::new();
    let tx1 = create_signed_tx(sender, receiver, 100, nonce);
    let tx2 = create_signed_tx(sender, receiver, 100, nonce); // Reuso de assinatura e saldo

    // O nó vulnerável insere ambas no bloco sem reverter
    chain.add_to_block(tx1);
    chain.add_to_block(tx2);
    
    assert!(chain.balances.get(sender) < 0); // O saldo do remetente ficou negativo!
}
```
*   **Resultado do Lab:** Todos os testes adversários em `vulnerable_chain` passaram, demonstrando a fragilidade das regras originais da rede.

---

## 6. Impacto Comercial e Técnico
*   **Perda de Consenso:** Nós legítimos divergem do estado da rede, resultando em forks que dividem a comunidade e os validadores.
*   **Inundação de Rede (DoS):** Nós offline por exaustão de memória, paralisando todas as operações comerciais de liquidação financeira baseadas na blockchain customizada.

---

## 7. Mitigação e Correções Aplicadas
As vulnerabilidades foram corrigidas no laboratório através da implementação de regras rígidas de integridade de estado (`core-chain`):

1.  **Validação de UTXO / Saldos e Nonces:** Cada transação deve conter um nonce sequencial que impede a reutilização de assinaturas (anti-replay) e o saldo é verificado estritamente em tempo de inserção no mempool e de montagem de bloco.
2.  **Validação de Dificuldade Dinâmica:** O nó recalcula de forma independente a dificuldade alvo para o bloco com base nos carimbos de data/hora (timestamps) dos últimos blocos e rejeita qualquer hash que não atenda ao alvo calculado.
3.  **Fila de Prioridade do Mempool com Taxas Limites:** Implementamos uma taxa mínima obrigatória por byte de transação. Transações com taxas mais altas são priorizadas, e o mempool rejeita transações de taxa zero quando atinge o limite de capacidade física.

---

## 8. Reteste e Validação
Após as mitigações, executamos a suite completa de testes em Rust:
```bash
cargo test --workspace
```
*   **Resultado:** Todos os 94 testes passaram com sucesso, incluindo os testes de mitigação que validam a integridade da blockchain frente a adulterações de histórico de blocos (`chain tampering`) e gastos duplos.

---

## 9. Lições de Negócio
*   **Não invente regras de criptografia ou consenso:** Utilizar frameworks estabelecidos e revisados pela comunidade é sempre preferível a tentar criar motores de consenso do zero, a menos que haja uma equipe de pesquisa dedicada e auditorias contínuas.
*   **A negação de serviço custa caro:** Proteções de taxa de rede não servem apenas para monetização, elas são mecanismos vitais de defesa de infraestrutura.

---

## 10. Como se aplica a Engajamentos Reais
Em auditorias de protocolos de blockchain de nível L1 ou L2:
*   Avaliamos de forma independente a lógica de transição de estado da máquina virtual (EVM ou Wasm).
*   Revisamos algoritmos de consenso e realizamos simulações de ataques de Sybil e 51%.
*   Testamos de forma estressante a rede de comunicação P2P contra ataques de eclipse e spam de mensagens.
