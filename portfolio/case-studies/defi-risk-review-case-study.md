# Case Study — DeFi Protocol Risk Review
**Tema:** AMM + Lending + Oracle Manipulation + Flash Loan

> [!NOTE]
> **Disclaimer:** Este documento descreve um estudo de caso simulado e executado em ambiente controlado de laboratório (CryptoSec Lab). Não representa um projeto realizado para um cliente real comercial, servindo exclusivamente para demonstrar nossa metodologia de auditoria técnica.

---

## 1. Contexto do Projeto
Os protocolos DeFi costumam depender de oráculos de preço on-chain para calcular o valor das garantias (colaterais) depositadas pelos usuários. Se um protocolo de empréstimo (Lending) consulta o preço de um token diretamente no pool de liquidez de um AMM de baixa liquidez (Spot Price Oracle), um atacante pode usar um empréstimo relâmpago (Flash Loan) para manipular temporariamente esse preço, permitindo que ele tome empréstimos subcolateralizados e drene a liquidez do protocolo de Lending.

## 2. Escopo da Auditoria
*   **Contratos Auditados:** `VulnerablePriceOracle.sol` (Oráculo baseado em spot price), `VulnerableLendingPool.sol` (Contrato de empréstimos), `VulnerableAMM.sol` (Criador de mercado automatizado).
*   **Linguagem:** Solidity ^0.8.0.
*   **Ferramentas Utilizadas:** Análise Matemática de Balanço de Pools, Provas de Conceito em Foundry (`forge test`).

## 3. Metodologia
Nossa análise focou na integridade do feed de preços:
1.  **Auditoria de Dependência Econômica:** Análise de como o oráculo calcula a taxa de câmbio entre os ativos do colateral.
2.  **Criação de Cenário de Fuzzing:** Simular oscilações extremas de saldo no pool de liquidez do AMM.
3.  **Implementação de Ataque POC:** Executar um teste que toma um flash loan, compra grandes quantidades de tokens no AMM para inflacionar o preço de forma artificial, deposita colateral manipulado no LendingPool, retira mais do que devia e devolve o flash loan com lucro.

## 4. Findings (Achados de Segurança)

### Achado 1: Uso de Preço Spot Sem Proteção (Gravidade: Crítica)
*   **Descrição:** O oráculo de preços calculava o valor de um ativo simplesmente dividindo o saldo de Token B pelo saldo de Token A presentes no AMM no bloco atual.
*   **Localização:** `VulnerablePriceOracle.sol#getPrice()`

### Achado 2: Falta de Limites de Liquidação e Empréstimo (Gravidade: Alta)
*   **Descrição:** O pool de empréstimos permitia que o usuário tomasse empréstimos com base no preço instantâneo do oráculo spot, sem qualquer verificação de desvio histórico ou limitadores de variação máxima de preço por bloco.
*   **Localização:** `VulnerableLendingPool.sol#borrow()`

---

## 5. Exploit Simulation (Prova de Conceito)
No laboratório, simulamos a exploração usando Foundry. O atacante executa as seguintes operações em uma única transação:
1.  Obtém um Flash Loan de $10.000$ Token B.
2.  Despeja os tokens no `VulnerableAMM` em troca de Token A. Esse swap desbalanceia severamente a reserva do AMM, multiplicando o preço spot do Token A por $10$.
3.  Deposita uma pequena quantidade de Token A como colateral no `VulnerableLendingPool`.
4.  Como o oráculo spot relata que o Token A vale $10$ vezes mais, o atacante toma um empréstimo gigante de Token B, excedendo a colateralização real.
5.  O atacante desfaz o swap no AMM (ou simplesmente mantém o excesso emprestado) e paga a taxa do Flash Loan.

### Resultado do Teste no Lab:
```solidity
function testAttackerBorrowsTooMuchWithManipulatedOracle() public {
    // Executa o script de ataque simulado
    vm.prank(attacker);
    flashLoanOracleAttacker.executeAttack(10_000e18);

    // O saldo de colateral do cofre do Lending Pool é drenado
    assertTrue(vulnerableLendingPool.isSolvent() == false);
}
```
*   **Status:** `[PASS] testAttackerBorrowsTooMuchWithManipulatedOracle()` provou a falha com sucesso.

---

## 6. Impacto Comercial e Técnico
*   **Falência Técnica:** O protocolo de Lending torna-se insolvente, restando dívidas incobráveis (bad debt) e nenhum ativo real para os depositantes legítimos sacarem.
*   **Perda de Credibilidade de Emissores:** Se o colateral manipulado envolver uma stablecoin, o ataque pode desencadear o depeg (desancoragem) e colapso econômico.

---

## 7. Mitigação e Correções Aplicadas
Para resolver esta vulnerabilidade sistemática, atualizamos a arquitetura (`SecureLendingPool.sol` e `SecurePriceOracle.sol`):

1.  **TWAP (Time-Weighted Average Price):** Alteramos o oráculo para usar a média ponderada pelo tempo de preço do Uniswap V2/V3. Isso exige que um atacante sustente a manipulação do pool por múltiplos blocos, o que é economicamente inviável.
2.  **Integração com Oráculos Descentralizados (Chainlink):** Passamos a utilizar feeds de dados descentralizados com múltiplas fontes independentes de liquidez off-chain e on-chain, protegidos contra flash loans.
3.  **Circuit Breaker (Disjuntor de Volatilidade):** Implementamos limites máximos de variação que travam novos empréstimos se o preço flutuar mais que uma porcentagem específica em um curto intervalo.

---

## 8. Reteste e Validação
Após a reestruturação, os testes demonstraram que tentativas de empréstimos com base em flutuações rápidas de spot price são rejeitadas:
```bash
forge test --match-path test/defi/LendingPoolAttack.t.sol
```
*   **Resultado:** O contrato `SecureLendingPool` rejeitou a transação do atacante por garantia insuficiente, mantendo a saúde financeira do pool.

---

## 9. Lições de Negócio
*   **Oráculos Spot são Perigosos:** Nunca confie no saldo atual de um pool de liquidez como fonte única de verdade para precificação de ativos digitais.
*   **Interdependência DeFi:** Vulnerabilidades não acontecem em isolamento. Um AMM seguro integrado a um Lending Pool mal desenhado gera um ecossistema frágil.

---

## 10. Como se aplica a Engajamentos Reais
Em nossas auditorias de DeFi:
*   Realizamos modelagens matemáticas das curvas de swap e cálculo de invariantes.
*   Recomendamos e auxiliamos na integração de oráculos como Chainlink, incluindo checagens de preços obsoletos (stale prices) e fallback para TWAP.
