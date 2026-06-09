# Technical One-Pager (Developer Sheet) — Web3 Security

**Escopo:** `[NomeDoContrato1].sol`, `[NomeDoContrato2].sol`  
**Compilador:** Solidity ^0.8.20  
**Framework de Teste:** Foundry / forge  

---

## 1. Arquitetura e Superfície de Ataque
O escopo baseia-se em um cofre ERC4626 modificado integrado a um proxy UUPS para upgrades lógicos. A superfície de ataque mapeada concentra-se em:
*   **Rotas de Saque e Depósito:** Manipulações de taxas de compartilhamento de ativos (share calculation) e reentrâncias em chamadas externas.
*   **Camada de Proxy:** Alinhamento de slots de memória (`storage slot collisions`) e proteção das funções `initialize()` e `authorizeUpgrade()`.
*   **Acesso Administrativo:** Controle de privilégios via `AccessControl` utilizando funções restritas de admin.

---

## 2. Detalhes Técnicos dos Achados e Evidências

### Achado: Reentrância em Retiradas
*   **Evidência:** O contrato de cofre utilizava transferência de fundos nativa através de `.call{value: ...}` antes da atualização do mapeamento de saldos locais do usuário:
    ```solidity
    // Vulnerável:
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
    balances[msg.sender] -= amount; // Efeito tardio
    ```
*   **Vetor de Exploit:** O atacante implementava um fallback reentrante que repetidamente invocava a mesma rota de retirada antes da execução da linha de subtração do saldo.

---

## 3. Recomendações e Correções Técnicas Aplicadas

### Mitigação de Reentrância:
Reordenamos as instruções aplicando o padrão estrito **Checks-Effects-Interactions (CEI)** e adicionamos a biblioteca `ReentrancyGuard` do OpenZeppelin:
```solidity
// Seguro (CEI + Guard):
function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount, "Insufficient balance"); // Check
    balances[msg.sender] -= amount; // Effect
    (bool success, ) = msg.sender.call{value: amount}(""); // Interaction
    require(success, "Transfer failed");
}
```

### Proteção de Proxy UUPS:
Adicionamos o construtor explícito que executa a desabilitação das funções de inicialização direta no contrato lógico base:
```solidity
/// @custom:oz-upgrades-unsafe-allow constructor
constructor() {
    _disableInitializers();
}
```

---

## 4. Pipeline de Reteste e Validação Técnica
*   **Suite de Teste Foundry:** Desenvolvemos um teste unitário de invasão simulada que valida que qualquer tentativa de reentrada resulta em reversão (`vm.expectRevert`).
*   **Comando de Execução de Testes:**
    ```bash
    forge test --match-contract ReentrancyAttackTest -vvv
    ```
*   **Status de Compilação:** Compilação com zero avisos críticos e suites de validação estática limpas.
