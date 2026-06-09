# Case Study — Bridge Security Review
**Tema:** Replay Attack, Validator Threshold & Domain Separation

> [!NOTE]
> **Disclaimer:** Este documento descreve um estudo de caso simulado e executado em ambiente controlado de laboratório (CryptoSec Lab). Não representa um projeto realizado para um cliente real comercial, servindo exclusivamente para demonstrar nossa metodologia de auditoria técnica.

---

## 1. Contexto do Projeto
Pontes cross-chain conectam diferentes redes de blocos e custodiam volumes maciços de ativos. Elas geralmente funcionam validando assinaturas off-chain de um conjunto de validadores selecionados. Se a assinatura gerada para autorizar um saque em uma rede não incluir um identificador único (como nonce ou Chain ID), um atacante pode interceptar a assinatura e executá-la repetidamente na mesma rede (Replay Attack) ou em redes diferentes, drenando os fundos depositados.

## 2. Escopo da Auditoria
*   **Contratos Auditados:** `VulnerableBridge.sol` (Contrato de custódia e emissão de tokens empacotados).
*   **Linguagem:** Solidity ^0.8.0.
*   **Ferramentas Utilizadas:** Análise Criptográfica de Assinaturas (ECDSA), Prova de Conceito com Foundry.

## 3. Metodologia
Nossa auditoria concentrou-se na camada criptográfica e de controle de transição de estados:
1.  **Auditoria de Verificação de Assinatura:** Investigação de como o método `ecrecover` ou a biblioteca `ECDSA` do OpenZeppelin valida o remetente.
2.  **Validação de Parâmetros de Mensagem:** Análise se o hash da mensagem inclui informações suficientes para contextualizar a rede e o uso.
3.  **Simulação de Ataque Replay:** Escrita de testes adversários para reutilizar assinaturas válidas em diferentes chamadas.

## 4. Findings (Achados de Segurança)

### Achado 1: Signature Replay — Ausência de Nonces (Gravidade: Crítica)
*   **Descrição:** O método de saque na ponte aceitava uma assinatura de validador sem rastrear se aquela assinatura específica já havia sido processada. Isso permitia replay contínuo na mesma rede.
*   **Localização:** `VulnerableBridge.sol#withdraw()`

### Achado 2: Ausência de Domain Separation (Gravidade: Crítica)
*   **Descrição:** A mensagem assinada não continha o ID da cadeia de blocos (Chain ID) nem o endereço do próprio contrato da ponte. Uma assinatura gerada para a testnet podia ser reexecutada na mainnet (cross-chain replay).
*   **Localização:** `VulnerableBridge.sol#verifySignature()`

### Achado 3: Threshold de Validação Insuficiente (Gravidade: Alta)
*   **Descrição:** Bastava uma única assinatura de validador para aprovar saques bilionários, expondo a ponte a um ponto único de falha caso um único validador fosse comprometido.
*   **Localização:** `VulnerableBridge.sol`

---

## 5. Exploit Simulation (Prova de Conceito)
No laboratório, simulamos a exploração utilizando testes Foundry. Um validador legítimo assina uma liberação de $10$ tokens para um usuário. O usuário executa o saque, e em seguida, reutiliza os mesmos parâmetros de transação e a mesma assinatura para sacar mais $10$ tokens repetidas vezes, até esvaziar o contrato.

### Resultado do Teste no Lab:
```solidity
function testBridgeMessageReplayDrainsVulnerableBridge() public {
    // 1. Gera assinatura válida para retirar 10 tokens
    bytes32 messageHash = keccak256(abi.encodePacked(user, 10e18));
    bytes memory signature = signMessage(messageHash, validatorPrivateKey);

    // 2. Executa saque legítimo de 10 tokens
    vulnerableBridge.withdraw(user, 10e18, signature);

    // 3. Executa o replay da mesma transação usando a mesma assinatura
    vulnerableBridge.withdraw(user, 10e18, signature); // Deveria reverter, mas passa

    // 4. Verifica que o usuário sacou mais do que devia
    assertEq(token.balanceOf(user), 20e18);
}
```
*   **Status:** `[PASS] testBridgeMessageReplayDrainsVulnerableBridge()` validou a vulnerabilidade.

---

## 6. Impacto Comercial e Técnico
*   **Drenagem Completa:** Esvaziamento total da custódia do contrato inteligente da ponte no lado de recepção.
*   **Hiperinflação de Wrapped Tokens:** Emissão descontrolada de tokens empacotados sem colateral no lado de destino.

---

## 7. Mitigação e Correções Aplicadas
Corrigimos o protocolo reestruturando o mecanismo de verificação criptográfica no laboratório (`SecureBridge.sol`):

1.  **Padrão EIP-712 e Domain Separation:** Criamos uma assinatura estruturada contendo o hash do nome da aplicação, versão, Chain ID da rede atual e endereço do contrato.
2.  **Mapeamento de Nonces / Assinaturas Processadas:** Implementamos um sistema de nonces incrementais por usuário ou marcamos as assinaturas já utilizadas em um mapeamento (`mapping(bytes32 => bool) processedSignatures`) para impedir reutilização.
3.  **Threshold Multisig (M-of-N):** Redesenhamos a lógica para exigir que uma transação de saque apresente assinaturas de pelo menos $K$ validadores diferentes de um conjunto de $N$ cadastrados.

---

## 8. Reteste e Validação
Testamos a ponte segura com as correções criptográficas:
```bash
forge test --match-path test/defi/BridgeReplayAttack.t.sol
```
*   **Resultado:** O contrato `SecureBridge` rejeitou com sucesso a transação duplicada com erro `SignatureAlreadyUsed` e invalidou assinaturas originadas em outras redes.

---

## 9. Lições de Negócio
*   **Criptografia requer Contexto:** Uma assinatura digital sem contexto de tempo (nonce), local (contrato receptor) e rede (Chain ID) é um cheque em branco.
*   **Redundância de Validação:** Confiar em chaves únicas é perigoso. O gerenciamento de validadores off-chain de pontes exige esquemas robustos de limite de quórum (Threshold).

---

## 10. Como se aplica a Engajamentos Reais
Em nossas auditorias de pontes e oráculos:
*   Avaliamos rigorosamente a criptografia das assinaturas e implementações da biblioteca `ECDSA`.
*   Aconselhamos o uso do padrão EIP-712 para mensagens legíveis e separadas por domínio.
*   Revisamos os fluxos e limites administrativos off-chain que configuram os validadores da ponte.
