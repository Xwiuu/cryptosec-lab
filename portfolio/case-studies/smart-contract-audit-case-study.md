# Case Study — Smart Contract Security Audit
**Tema:** Reentrancy, Access Control & Upgradeability Risk

> [!NOTE]
> **Disclaimer:** Este documento descreve um estudo de caso simulado e executado em ambiente controlado de laboratório (CryptoSec Lab). Não representa um projeto realizado para um cliente real comercial, servindo exclusivamente para demonstrar nossa metodologia de auditoria técnica.

---

## 1. Contexto do Projeto
No ecossistema de finanças descentralizadas, cofres de depósitos estruturados e contratos atualizáveis (upgradeable proxies) são alvos frequentes de ataques de alta gravidade. Este estudo de caso aborda a auditoria de um cofre de rendimentos simplificado configurado em uma arquitetura de proxy onde foram descobertas falhas críticas de reentrância em saques, ausência de inicialização protegida e controle de acesso inadequado em upgrades de implementação.

## 2. Escopo da Auditoria
*   **Contratos Auditados:** `VulnerableBank.sol` (Lógica de depósito e saque), `VulnerableUpgradeable.sol` (Contrato lógico de proxy).
*   **Linguagem:** Solidity ^0.8.0.
*   **Ferramentas Utilizadas:** Revisão Manual de Código, Análise Estática Heurística (CryptoSec Scanner), Framework Foundry.

## 3. Metodologia
Nossa auditoria seguiu o pipeline padrão:
1.  **Revisão Inicial de Arquitetura:** Mapeamento de fluxos de fundos e privilégios.
2.  **Análise Estática Automatizada:** Rodada preliminar com o scanner heurístico para identificar assinaturas conhecidas de reentrância.
3.  **Análise Manual Profunda:** Verificação detalhada de checagens de estado, atualizações de saldos e transições de privilégios.
4.  **Criação de Exploit de Prova de Conceito (PoC):** Construção de testes adversários via Foundry para confirmar a viabilidade prática dos ataques.
5.  **Validação de Correções:** Reteste após a implementação de contramedidas.

## 4. Findings (Achados de Segurança)

### Achado 1: Reentrancy no Saque (Gravidade: Crítica)
*   **Descrição:** O método de retirada do cofre enviava fundos ao remetente (`msg.sender.call{value: ...}`) antes de atualizar o saldo interno da conta.
*   **Localização:** `VulnerableBank.sol#withdraw()`

### Achado 2: Inicialização Desprotegida de Contrato Lógico (Gravidade: Crítica)
*   **Descrição:** O contrato de implementação atualizável não protegia a função de inicialização. Qualquer agente externo podia chamar `initialize()` no contrato de implementação, tornando-se o proprietário da lógica base.
*   **Localização:** `VulnerableUpgradeable.sol#initialize()`

### Achado 3: Upgrade Sem Autorização (Gravidade: Crítica)
*   **Descrição:** A função que realizava o upgrade da implementação apontada pelo proxy não validava adequadamente se o remetente era de fato o administrador autorizado.
*   **Localização:** `VulnerableUpgradeable.sol#upgradeTo()`

---

## 5. Exploit Simulation (Prova de Conceito)
No laboratório, simulamos o ataque utilizando o Foundry (`forge test`). Criamos um contrato atacante (`ReentrancyExploit.sol`) que tirava vantagem do recebimento de Ether no método `receive()` para reentrar repetidamente na função `withdraw()`, drenando completamente as reservas do cofre.

### Trecho da Simulação de Exploit no Teste:
```solidity
function testReentrancyDrainsVulnerableBank() public {
    // 1. Usuário legítimo deposita 10 ETH no VulnerableBank
    vm.prank(user);
    vulnerableBank.deposit{value: 10 ether}();

    // 2. Atacante deposita 1 ETH para poder sacar
    vm.prank(attacker);
    attackerContract.attack{value: 1 ether}();

    // 3. Saldo do cofre vulnerável é zerado
    assertEq(address(vulnerableBank).balance, 0);
}
```
*   **Resultado do Teste no Lab:** `[PASS] testReentrancyDrainsVulnerableBank()` provou que o ataque é viável e drena os fundos com sucesso.

---

## 6. Impacto Comercial e Técnico
Se este contrato fosse implantado na mainnet:
*   **Impacto Financeiro:** Perda total de todo o Ether ou tokens ERC20 depositados por todos os usuários.
*   **Impacto Reputacional:** Perda de confiança na marca, colapso do token de governança e interrupção permanente do projeto.

---

## 7. Mitigação e Correções Aplicadas
Para corrigir os riscos identificados, redesenhamos o fluxo lógico dos contratos inteligentes no laboratório (`SecureBank.sol` e `SecureUpgradeable.sol`):

1.  **Padrão Checks-Effects-Interactions:** Reordenamos o código para que o saldo do usuário seja atualizado (`Effects`) antes de fazer a chamada externa de transferência (`Interactions`).
2.  **Uso de ReentrancyGuard:** Adicionamos o modificador `nonReentrant` às funções críticas de escrita.
3.  **Inicialização Segura:** Adicionamos a checagem `initializer` da biblioteca OpenZeppelin no construtor para desabilitar a inicialização do contrato lógico direto no deploy (`_disableInitializers()`).
4.  **Controle de Acesso estrito em Upgrades:** Protegemos a função de upgrade com o modificador `onlyAdmin` ou `onlyOwner`.

---

## 8. Reteste e Validação
Executamos novamente a suite de testes no Foundry:
```bash
forge test --match-path test/ReentrancyAttack.t.sol
```
*   **Resultado:** Os testes provaram que o contrato `SecureBank` bloqueia com sucesso as chamadas de reentrância, revertendo a transação do atacante e mantendo os saldos íntegros.

---

## 9. Lições de Negócio
*   **Segurança by Design:** A segurança não é uma camada adicionada depois do desenvolvimento; ela dita a arquitetura. Fluxos de atualização complexos devem ser desenhados de forma simples e transparente.
*   **Custos de Correção:** Mitigar uma falha lógica na testnet ou durante a auditoria custa frações insignificantes em comparação à perda de TVL e resgates forçados pós-deploy.

---

## 10. Como se aplica a Engajamentos Reais
Em auditorias de clientes reais:
*   Mapeamos sistematicamente todas as rotas de entrada e saída de fundos.
*   Avaliamos proxies de atualização e verificamos as condições iniciais de deploy.
*   Trabalhamos em conjunto com os desenvolvedores enviando PRs focados no padrão *Checks-Effects-Interactions* para que as correções não quebrem outras integrações.
