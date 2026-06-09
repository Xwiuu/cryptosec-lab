# Relatório de Auditoria de Smart Contracts

**Projeto:** Vulnerable Protocol Suite  
**Versão Auditada:** v1.0.0  
**Data da Auditoria:** 09 de Junho de 2026  
**Auditor:** CryptoSec Lab  
**Classificação:** Público  

---

## 1. Executive Summary

A CryptoSec Lab conduziu uma auditoria de segurança nos contratos inteligentes do **Vulnerable Protocol Suite**, um conjunto de contratos educacionais que demonstram vulnerabilidades comuns em blockchain. Foram analisados 5 contratos totalizando aproximadamente 210 linhas de código Solidity.

A auditoria identificou **5 vulnerabilidades**: 2 Críticas, 2 Altas e 1 Média. As vulnerabilidades críticas incluem reentrância no saque de ETH (podendo drenar todo o saldo do contrato) e mint público sem restrições (permitindo inflar o supply infinitamente). As vulnerabilidades altas envolvem aleatoriedade previsível e funções de upgrade sem controle de acesso.

Este relatório detalha cada achado com prova de conceito, impacto, causa raiz e recomendações de correção. Recomenda-se que todas as vulnerabilidades sejam corrigidas antes de qualquer implantação em produção.

---

## 2. Escopo

### Contratos Auditados

| Contrato | Arquivo | Linhas | Funcionalidade |
|----------|---------|--------|----------------|
| VulnerableBank | contracts/src/vulnerable/VulnerableBank.sol | 29 | Cofre com depósito e saque de ETH |
| VulnerableToken | contracts/src/vulnerable/VulnerableToken.sol | 48 | Token ERC-20 simplificado |
| VulnerableRandomness | contracts/src/vulnerable/VulnerableRandomness.sol | 40 | Jogo de aposta com aleatoriedade on-chain |
| VulnerableUpgradeable | contracts/src/vulnerable/VulnerableUpgradeable.sol | 55 | Proxy upgradeable sem acesso |
| VulnerableApprovalVault | contracts/src/vulnerable/VulnerableApprovalVault.sol | 44 | Vault com depósito de tokens ERC-20 |
| **Total** | | **~210** | |

### Fora de Escopo

- Contratos do ecossistema DeFi (VulnerableAMM, VulnerableLendingPool, etc.)
- Testes unitários e de integração
- Infraestrutura de deploy e scripts
- Dependências externas (OpenZeppelin, etc.)
- Frontend e interfaces de usuário

---

## 3. Metodologia e Matriz de Risco

A auditoria seguiu a metodologia padrão do setor baseada no [SWC Registry](https://swcregistry.io/) e nas diretrizes do [Consensys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/).

### Classificação de Severidade

| Severidade | Definição |
|------------|-----------|
| **Crítico** | Vulnerabilidade que pode resultar em perda total de fundos ou controle do contrato. Exploração é trivial. |
| **Alto** | Vulnerabilidade que pode resultar em perda significativa de fundos ou quebra de funcionalidade crítica. |
| **Médio** | Vulnerabilidade que pode resultar em perda limitada de fundos ou comportamento inesperado sob condições específicas. |
| **Baixo** | Problema menor que não resulta em perda direta de fundos, mas viola boas práticas. |
| **Informativo** | Observação ou recomendação sem impacto direto na segurança. |

### Resumo dos Achados

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

### F-001: Reentrância em VulnerableBank.withdraw()

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **CWE** | CWE-841 |
| **SWC** | SWC-107 |
| **Código** | VulnerableBank.sol:16-21 |

#### Descrição

A função `withdraw()` viola o padrão Checks-Effects-Interactions ao atualizar o saldo do usuário **após** realizar a chamada externa via `call{value: amount}("")`. Isso permite que um contrato malicioso ataque via reentrância: no `receive()` do contrato atacante, a função `withdraw()` é chamada novamente antes que o saldo seja debitado, permitindo sacar múltiplas vezes o mesmo valor.

```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    (bool ok,) = msg.sender.call{value: amount}("");   // External call ANTES do update
    require(ok, "Transfer failed");
    unchecked {
        balances[msg.sender] -= amount;                 // Update DEPOIS - REENTRÂNCIA!
    }
}
```

#### Impacto

Drenagem completa de todos os fundos de ETH do contrato. Um atacante com apenas 1 ETH depositado pode drenar todo o saldo do contrato em uma única transação.

#### Probabilidade de Exploração

**Trivial.** A exploração requer apenas a implantação de um contrato atacante e chamar `withdraw()`. Não há pré-requisitos especiais.

#### Prova de Conceito

```solidity
contract ReentrancyAttacker {
    VulnerableBank public bank;
    uint256 public constant ATTACK_AMOUNT = 1 ether;

    constructor(address _bank) payable {
        bank = VulnerableBank(_bank);
    }

    function attack() external {
        bank.deposit{value: ATTACK_AMOUNT}();
        bank.withdraw(ATTACK_AMOUNT);
    }

    receive() external payable {
        if (address(bank).balance >= ATTACK_AMOUNT) {
            bank.withdraw(ATTACK_AMOUNT);
        }
    }
}
```

#### Causa Raiz

Violação do padrão **Checks-Effects-Interactions (CEI)**. O efeito (atualização do saldo) ocorre após a interação (chamada externa), permitindo que o controle seja sequestrado antes da atualização de estado.

#### Recomendação

1. **Mover a atualização do saldo antes da chamada externa** (CEI pattern):

```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;                     // Update PRIMEIRO
    (bool ok,) = msg.sender.call{value: amount}("");    // External call DEPOIS
    require(ok, "Transfer failed");
}
```

2. **Usar ReentrancyGuard** do OpenZeppelin para proteção adicional contra cross-function reentrancy.
3. **Considerar o uso de pull-over-push pattern** onde os usuários sacam de um mapping de saldos pendentes.

#### Reteste

[Pendente]

---

### F-002: Mint Público sem Restrições em VulnerableToken

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **CWE** | CWE-862 |
| **SWC** | SWC-105 |
| **Código** | VulnerableToken.sol:15-19 |

#### Descrição

A função `mint()` não possui qualquer modificador de acesso. Qualquer pessoa pode chamá-la e criar tokens ilimitados para qualquer endereço. Não há verificação de `onlyOwner`, `onlyRole` ou qualquer outro controle.

```solidity
function mint(address to, uint256 amount) external {
    balanceOf[to] += amount;
    totalSupply += amount;
    emit Transfer(address(0), to, amount);
}
```

#### Impacto

- Inflação infinita do supply do token, destruindo completamente seu valor
- Um atacante pode mintar 1e30 tokens e vender em qualquer DEX, drenando a liquidez
- Perda total de confiança no token

#### Probabilidade de Exploração

**Trivial.** Basta chamar `mint(atacante, 1e30)`.

#### Prova de Conceito

```solidity
// No console ou script:
// VulnerableToken(vulnAddr).mint(attacker, 1_000_000_000 ether);
// Balance do atacante agora é astronômico, token sem valor.
```

#### Causa Raiz

Ausência do modificador `onlyOwner` ou qualquer controle de acesso na função `mint()`. O contrato VulnerableToken não herda de `Ownable` nem define seu próprio controle.

#### Recomendação

1. **Adicionar modificador de acesso** à função `mint()`:

```solidity
address public owner;

modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

function mint(address to, uint256 amount) external onlyOwner {
    balanceOf[to] += amount;
    totalSupply += amount;
    emit Transfer(address(0), to, amount);
}
```

2. **Definir um supply cap** máximo para evitar mint excessivo mesmo pelo owner.
3. **Considerar herdar de OpenZeppelin's ERC20** com `_mint` protegido.

#### Reteste

[Pendente]

---

### F-003: Aleatoriedade Previsível em VulnerableRandomness

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **CWE** | CWE-338 |
| **SWC** | SWC-120 |
| **Código** | VulnerableRandomness.sol:24-32 |

#### Descrição

A função `_badRandom()` utiliza `block.timestamp`, `block.prevrandao`, `blockhash(block.number - 1)` e `block.number` como fontes de entropia. Todos esses valores são públicos e influenciáveis por mineradores/validadores. Um atacante pode prever o resultado do "sorteio" e ganhar todas as apostas.

```solidity
function _badRandom() internal view returns (uint256) {
    return uint256(
        keccak256(
        abi.encodePacked(
        block.timestamp, block.prevrandao, blockhash(block.number - 1), block.number, msg.sender
    )
    )
    ) % 100;
}
```

#### Impacto

- Jogadores podem prever o resultado e apostar apenas quando vão ganhar
- Drenagem dos fundos do contrato de aposta
- Quebra completa do jogo

#### Probabilidade de Exploração

**Alta.** Um minerador pode manipular o timestamp dentro de uma janela de ~15 segundos. Um atacante pode simplesmente simular o resultado localmente antes de enviar a transação.

#### Prova de Conceito

```solidity
// Atacante simula localmente:
function predict(address game, address player) external view returns (uint256) {
    uint256 predicted = uint256(
        keccak256(
            abi.encodePacked(block.timestamp, block.prevrandao, blockhash(block.number - 1), block.number, player)
        )
    ) % 100;
    return predicted;
}

// Se prediction == predicted, o atacante aposta e ganha com certeza.
```

#### Causa Raiz

Uso de dados de blockchain on-chain como fonte de aleatoriedade. Tudo na blockchain é público e determinístico. Mineradores podem influenciar `block.timestamp` e `block.prevrandao`.

#### Recomendação

1. **Substituir por Chainlink VRF (Verifiable Random Function)** para gerar aleatoriedade verificável e imprevisível.
2. **Implementar esquema de commit-reveal** onde os jogadores primeiro commitam um hash e depois revelam.
3. **Nunca usar block.timestamp, blockhash, prevrandao ou block.number** como única fonte de aleatoriedade.

#### Reteste

[Pendente]

---

### F-004: Funções de Upgrade sem Proteção em VulnerableUpgradeable

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **CWE** | CWE-862 |
| **SWC** | SWC-105 |
| **Código** | VulnerableUpgradeable.sol:12-21 |

#### Descrição

Duas vulnerabilidades no mesmo contrato:

1. **`initialize()` não tem proteção contra front-running**: Qualquer pessoa pode chamar `initialize()` antes do deployer, tornando-se admin.
2. **`upgradeTo()` não tem controle de acesso**: Qualquer um pode alterar o endereço de implementação.

```solidity
function initialize(address _implementation) external {
    require(admin == address(0), "Already initialized");
    admin = msg.sender;
    implementation = _implementation;
}

function upgradeTo(address newImplementation) external {
    implementation = newImplementation;
}
```

#### Impacto

- Um atacante pode front-run a transação de deploy e tomar controle total do proxy
- Um atacante pode apontar para uma implementação maliciosa que rouba fundos ou autodestrói o contrato
- Perda total de controle e possivelmente de todos os fundos

#### Probabilidade de Exploração

**Alta.** Front-running de `initialize()` é um ataque clássico. Para `upgradeTo()`, qualquer pessoa pode chamar a qualquer momento.

#### Prova de Conceito

```solidity
// Front-run: monitorar mempool por create do VulnerableUpgradeable
// Imediatamente chamar initialize(attackerContract)
// Agora attackerContract é a implementação ativa

// Upgrade para contrato malicioso:
contract MaliciousImpl {
    function steal() external {
        selfdestruct(payable(tx.origin)); // ou transfere fundos
    }
}

// Chamar upgradeTo(address(new MaliciousImpl()))
// Chamar steal() via fallback -> delegatecall para código malicioso
```

#### Causa Raiz

Ausência completa de controle de acesso (`onlyOwner`, `onlyAdmin`, etc.) nas funções críticas de upgrade.

#### Recomendação

1. **Usar OpenZeppelin UUPSUpgradeable** que implementa `onlyOwner` corretamente.
2. **Adicionar controle de acesso**:

```solidity
function initialize(address _implementation) external {
    require(admin == address(0), "Already initialized");
    require(msg.sender == deployer, "Not authorized");
    admin = msg.sender;
    implementation = _implementation;
}

function upgradeTo(address newImplementation) external {
    require(msg.sender == admin, "Only admin");
    implementation = newImplementation;
}
```

3. **Usar construtor com `_disableInitializers()`** do OpenZeppelin para prevenir que implementações sejam inicializadas.
4. **Considerar timelock** para upgrades.

#### Reteste

[Pendente]

---

### F-005: Saque Irrestrito em VulnerableApprovalVault

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Médio** |
| **Status** | Aberto |
| **CWE** | CWE-285 |
| **SWC** | SWC-115 |
| **Código** | VulnerableApprovalVault.sol:29-32 |

#### Descrição

A função `withdrawToken()` permite que o `owner` (único administrador) saque tokens de qualquer usuário sem verificar se o destinatário possui depósitos correspondentes. A lógica `deposits[to] -= amount` usa o parâmetro `to` (destino do saque) em vez de verificar o remetente original.

```solidity
function withdrawToken(address token, address to, uint256 amount) external onlyOwner {
    IERC20Minimal(token).transfer(to, amount);
    deposits[to] -= amount;  // Atualiza depósito do DESTINO, não de quem perdeu
}
```

#### Impacto

- O owner pode drenar todos os depósitos de todos os usuários
- Usuários perdem seus tokens depositados sem consentimento
- Quebra da confiança no vault

#### Probabilidade de Exploração

**Média.** Requer que o owner seja malicioso ou que a chave do owner seja comprometida. Não é explorável por terceiros diretamente.

#### Prova de Conceito

```solidity
// Owner chama:
// vault.withdrawToken(tokenAddress, victimAddress, victimDeposit);
// Tokens da vítima são enviados para victimAddress (ou para attacker se to = attacker)
```

#### Causa Raiz

- Ausência de verificação de permissão do depositante original
- Lógica confusa onde `deposits[to]` é debitado em vez de verificar que quem perdeu o token concorda
- Acesso administrativo sem supervisão (apenas um owner, sem multisig)

#### Recomendação

1. **Restringir saque ao próprio depositante**:

```solidity
function withdrawToken(address token, uint256 amount) external {
    require(deposits[msg.sender] >= amount, "Insufficient deposits");
    deposits[msg.sender] -= amount;
    IERC20Minimal(token).transfer(msg.sender, amount);
}
```

2. **Remover função `withdrawAll`** ou protegê-la com multisig e timelock.
3. **Adicionar evento de retirada** com todos os parâmetros.
4. **Implementar withdraw com pull-over-push** para evitar surpresas.

#### Reteste

[Pendente]

---

## 5. Recomendações Prioritárias

| Prioridade | Recomendação | Achados Relacionados |
|------------|-------------|---------------------|
| **P-01** | Aplicar padrão Checks-Effects-Interactions em TODAS as funções que fazem chamadas externas | F-001 |
| **P-02** | Adicionar controle de acesso (onlyOwner) em mint(), upgradeTo() e initialize() | F-002, F-004 |
| **P-03** | Substituir aleatoriedade on-chain por Chainlink VRF ou commit-reveal | F-003 |
| **P-04** | Implementar withdraw por usuário em vez de withdraw por admin no vault | F-005 |
| **P-05** | Adicionar testes de segurança específicos para reentrância, front-running e oracle manipulation | Todos |

---

## 6. Sumário de Reteste

| ID | Achado | Severidade | Status | Retestado em | Resultado |
|----|--------|-----------|--------|-------------|-----------|
| F-001 | Reentrância em withdraw | Crítico | Aberto | — | Pendente |
| F-002 | Mint público | Crítico | Aberto | — | Pendente |
| F-003 | Aleatoriedade previsível | Alto | Aberto | — | Pendente |
| F-004 | Upgrade sem proteção | Alto | Aberto | — | Pendente |
| F-005 | Saque irrestrito no vault | Médio | Aberto | — | Pendente |

---

## 7. Apêndices

### Apêndice A: Modelo de Ameaças

| Ameaça | Ator | Superfície | Impacto |
|--------|------|------------|---------|
| Reentrância | Atacante externo | withdraw() call | Perda total de ETH |
| Mint infinito | Qualquer usuário | mint() público | Inflação total do supply |
| Previsão de aleatoriedade | Minerador/jogador | _badRandom() | Drenagem do jogo |
| Tomada de proxy | Front-runner | initialize() | Controle total |
| Roubo de depósitos | Owner malicioso | withdrawToken() | Perda de tokens |

### Apêndice B: Cobertura de Testes

Recomenda-se adicionar testes para:
- Teste de reentrância com contrato atacante
- Teste de mint por não-admin (deve reverter)
- Teste de previsão de aleatoriedade
- Teste de front-run de initialize
- Teste de saque não autorizado

### Apêndice C: Referências

- [SWC-107: Reentrancy](https://swcregistry.io/docs/SWC-107)
- [SWC-105: Unprotected Ether Withdrawal](https://swcregistry.io/docs/SWC-105)
- [SWC-120: Weak Sources of Randomness](https://swcregistry.io/docs/SWC-120)
- [SWC-115: Authorization through tx.origin](https://swcregistry.io/docs/SWC-115)
- [Consensys Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OpenZeppelin Security Audits](https://blog.openzeppelin.com/security-audits/)
- [Ethereum Smart Contract Security](https://ethereum.org/en/developers/docs/smart-contracts/security/)

---

---

**CryptoSec Lab**  
Contato: security@cryptoseclab.com  
Website: https://cryptoseclab.com  
Este relatório é confidencial e de uso exclusivo do cliente auditado.
