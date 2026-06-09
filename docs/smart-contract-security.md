# Smart Contract Security

## Vulnerabilidades Comuns

### 1. Reentrancy
Chamada externa antes de atualizar estado.
**Mitigacao:** Checks-Effects-Interactions, ReentrancyGuard.

### 2. Access Control
Funcoes sensiveis sem restricao.
**Mitigacao:** Modifier onlyOwner, OpenZeppelin AccessControl.

### 3. Oracle Manipulation
Preco unico manipulavel.
**Mitigacao:** Multiplos sources, TWAP, deviation check.

### 4. Flash Loan Attacks
Emprestimo sem colateral para manipular estado.
**Mitigacao:** Snapshot, timelock, TWAP.

### 5. Integer Overflow/Underflow
Solubility ^0.8+ tem protecao nativa.
**Mitigacao:** Usar ^0.8, SafeMath para versoes antigas.

### 6. Bad Randomness
block.timestamp/blockhash sao previsiveis.
**Mitigacao:** Chainlink VRF, commit-reveal.

### 7. Front-Running / MEV
Ordem de transacao explorada.
**Mitigacao:** Slippage protection, private mempool.

## Ferramentas de Auditoria

- Slither: Analise estatica
- Mythril: Deteccao de vulnerabilidades
- Echidna: Fuzzing
- Foundry: Testes e fuzzing
