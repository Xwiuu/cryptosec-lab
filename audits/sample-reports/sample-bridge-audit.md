# Relatório de Auditoria de Bridge

**Projeto:** Vulnerable Bridge  
**Versão Auditada:** v1.0.0  
**Data da Auditoria:** 09 de Junho de 2026  
**Auditor:** CryptoSec Lab  
**Classificação:** Público  

---

## 1. Executive Summary

A CryptoSec Lab conduziu uma auditoria de segurança no **VulnerableBridge**, um contrato educacional que implementa uma bridge entre chains com funcionalidades de lock/mint e burn/release.

Foram identificadas **4 vulnerabilidades**: 2 Críticas e 2 Altas. As vulnerabilidades críticas incluem a ausência total de proteção contra replay de mensagens (permitindo mint infinito de wrapped tokens) e um sistema de validação centralizado com apenas um validador (single point of failure). As vulnerabilidades altas envolvem a falta de chain ID no hash da mensagem e ausência de nonce.

---

## 2. Escopo

| Contrato | Arquivo | Linhas | Funcionalidade |
|----------|---------|--------|----------------|
| VulnerableBridge | contracts/src/defi/vulnerable/VulnerableBridge.sol | 58 | Bridge lock/mint e burn/release |
| **Total** | | **58** | |

---

## 3. Resumo dos Achados

| Severidade | Quantidade |
|------------|-----------|
| **Crítico** | 2 |
| **Alto** | 2 |
| **Médio** | 0 |
| **Baixo** | 0 |
| **Informativo** | 0 |

---

## 4. Achados Detalhados

---

### F-001: Ausência de Chain ID no Hash da Mensagem

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **CWE** | CWE-345 |
| **SWC** | SWC-121 |
| **Código** | VulnerableBridge.sol:30, 34-39 |

#### Descrição

A mensagem emitida no evento `Lock` não inclui o identificador da chain de origem (`chainId`). O mesmo validador pode operar em múltiplas chains, e uma mensagem gerada na chain A pode ser reproduzida na chain B.

```solidity
function lock(address token, uint256 amount, address to) external {
    IERC20Minimal(token).transferFrom(msg.sender, address(this), amount);
    lockedTokens[token] += amount;
    bytes memory message = abi.encode(token, amount, to, block.timestamp);
    emit Lock(message);
}
```

O hash da mensagem não contém `chainId`, `block.chainid` ou qualquer domínio específico.

#### Impacto

- Uma mensagem de lock na chain A (Ethereum) pode ser reutilizada na chain B (Polygon)
- Atacante pode bridgear tokens em uma chain e reivindicar na outra sem novo lock
- Perda total dos fundos da bridge

#### Recomendação

Incluir `block.chainid` no hash da mensagem e validar no destino:

```solidity
function lock(address token, uint256 amount, address to) external {
    bytes memory message = abi.encode(token, amount, to, block.chainid, block.timestamp, nonce++);
    emit Lock(message);
}

function mintWrapped(bytes calldata message, bytes calldata) external onlyValidator {
    (address originalToken, uint256 amount, address to, uint256 chainId,,) =
        abi.decode(message, (address, uint256, address, uint256, uint256, uint256));
    require(chainId == SOURCE_CHAIN_ID, "Invalid chain ID");
    // ...
}
```

---

### F-002: Ausência de Nonce na Mensagem

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **CWE** | CWE-345 |
| **SWC** | SWC-121 |
| **Código** | VulnerableBridge.sol:30 |

#### Descrição

A mensagem de lock não contém um campo de nonce incremental. Como não há rastreamento de mensagens processadas e a mensagem não tem identificador único, múltiplas mensagens idênticas (mesmo token, amount, to) são indistinguíveis.

```solidity
bytes memory message = abi.encode(token, amount, to, block.timestamp);
```

#### Impacto

- Duas transações de lock com mesmos parâmetros geram a mesma mensagem
- O validador não consegue distinguir transações distintas
- Facilita ataques de replay

#### Recomendação

```solidity
uint256 public nonce;

function lock(address token, uint256 amount, address to) external {
    bytes memory message = abi.encode(token, amount, to, block.chainid, block.timestamp, nonce);
    emit Lock(message);
    nonce++;
}
```

---

### F-003: Validador Único (Single Point of Failure)

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **CWE** | CWE-1104 |
| **SWC** | SWC-104 |
| **Código** | VulnerableBridge.sol:8, 17-19, 55-57 |

#### Descrição

A bridge utiliza um único validador (`address public validator`). Todas as funções críticas (`mintWrapped`, `release`, `setValidator`) são protegidas apenas por `onlyValidator`. Se a chave do validador for comprometida, o atacante tem controle total sobre a bridge.

```solidity
address public validator;

modifier onlyValidator() {
    require(msg.sender == validator, "Only validator");
    _;
}

function setValidator(address _validator) external onlyValidator {
    validator = _validator;
}
```

#### Impacto

- Comprometimento da chave do validador = perda total de todos os fundos
- Validador pode mintar wrapped tokens arbitrariamente
- Validador pode liberar tokens locked sem burn correspondente
- Validador pode transferir o papel de validador para qualquer endereço

#### Recomendação

Implementar um esquema de múltiplos validadores com threshold:

```solidity
address[] public validators;
mapping(address => bool) public isValidValidator;
uint256 public constant MIN_SIGNATURES = 3;

function mintWrapped(bytes calldata message, bytes[] calldata signatures) external {
    bytes32 messageHash = keccak256(message);
    require(!processedMessages[messageHash], "Already processed");
    require(_verifySignatures(messageHash, signatures), "Not enough signatures");
    processedMessages[messageHash] = true;
    // ...
}

function _verifySignatures(bytes32 hash, bytes[] calldata signatures) internal view returns (bool) {
    uint256 count;
    for (uint256 i = 0; i < signatures.length; i++) {
        address signer = ECDSA.recover(hash, signatures[i]);
        if (isValidValidator[signer]) count++;
    }
    return count >= MIN_SIGNATURES;
}
```

---

### F-004: Ausência de Mapeamento de Mensagens Processadas

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **CWE** | CWE-345 |
| **SWC** | SWC-121 |
| **Código** | VulnerableBridge.sol:34-39 |

#### Descrição

Não existe um mapping `mapping(bytes32 => bool) public processedMessages` para rastrear quais mensagens já foram processadas. O validador pode processar a mesma mensagem múltiplas vezes.

```solidity
function mintWrapped(bytes calldata message, bytes calldata) external onlyValidator {
    (address originalToken, uint256 amount, address to) =
        abi.decode(message, (address, uint256, address));
    wrappedToken.transfer(to, amount);
    wrappedSupply[originalToken] += amount;
    emit Mint(message);
    // Sem verificação de mensagem já processada!
}
```

#### Impacto

Mesmo com nonce e chain ID, se não houver um registro de mensagens processadas, um validador malicioso pode processar a mesma mensagem várias vezes, mintando wrapped tokens infinitamente.

#### Recomendação

```solidity
mapping(bytes32 => bool) public processedMessages;

function mintWrapped(bytes calldata message, bytes calldata) external onlyValidator {
    bytes32 messageHash = keccak256(message);
    require(!processedMessages[messageHash], "Message already processed");
    processedMessages[messageHash] = true;
    // ... resto
}
```

---

## 5. Recomendações Prioritárias

| Prioridade | Recomendação | Achados |
|------------|-------------|---------|
| P-01 | Implementar multisig com threshold de validadores | F-003 |
| P-02 | Adicionar nonce e chain ID na mensagem | F-001, F-002 |
| P-03 | Implementar mapping de mensagens processadas | F-004 |
| P-04 | Adicionar rate limiting por token/usuário | — |
| P-05 | Adicionar emergency pause e shutdown | — |

---

## 6. Referências

- [SWC-121: Missing Protection Against Signature Replay Attacks](https://swcregistry.io/docs/SWC-121)
- [SWC-104: Unchecked Return Value](https://swcregistry.io/docs/SWC-104)
- [Wormhole Bridge Security](https://wormhole.com/docs/)
- [Axelar Network Security Model](https://docs.axelar.dev/)
- [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)

---

**CryptoSec Lab**  
Contato: security@cryptoseclab.com
