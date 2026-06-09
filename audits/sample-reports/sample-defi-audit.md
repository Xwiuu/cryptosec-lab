# Relatório de Auditoria DeFi

**Projeto:** Vulnerable DeFi Suite  
**Versão Auditada:** v1.0.0  
**Data da Auditoria:** 09 de Junho de 2026  
**Auditor:** CryptoSec Lab  
**Classificação:** Público  

---

## 1. Executive Summary

A CryptoSec Lab realizou uma auditoria de segurança no **Vulnerable DeFi Suite**, um conjunto de contratos educacionais do ecossistema DeFi (Finanças Descentralizadas). Foram analisados 4 contratos: VulnerableAMM, VulnerablePriceOracle, VulnerableLendingPool e VulnerableStablecoin.

Identificamos **6 vulnerabilidades**: 2 Críticas, 2 Altas e 2 Médias. As vulnerabilidades críticas incluem manipulação de oracle de preço público e falta de verificação de health factor no empréstimo, permitindo que um atacante empreste sem colateral suficiente. As vulnerabilidades altas envolvem falta de proteção contra slippage e ataques de replay em bridge.

Recomenda-se a correção imediata das vulnerabilidades críticas antes de qualquer deploy em produção.

---

## 2. Escopo

### Contratos Auditados

| Contrato | Arquivo | Linhas | Funcionalidade |
|----------|---------|--------|----------------|
| VulnerableAMM | contracts/src/defi/vulnerable/VulnerableAMM.sol | 73 | Automated Market Maker |
| VulnerablePriceOracle | contracts/src/defi/vulnerable/VulnerablePriceOracle.sol | 19 | Oracle de preço |
| VulnerableLendingPool | contracts/src/defi/vulnerable/VulnerableLendingPool.sol | 75 | Pool de empréstimos |
| VulnerableStablecoin | contracts/src/defi/vulnerable/VulnerableStablecoin.sol | 84 | Stablecoin colateralizada |
| **Total** | | **~251** | |

### Fora de Escopo

- VulnerableBridge, VulnerableFlashLoanPool, VulnerableYieldFarm, VulnerableLiquidationEngine
- Frontend e interfaces
- Scripts de deploy
- Testes automatizados

---

## 3. Metodologia e Matriz de Risco

A auditoria segue as diretrizes do [SWC Registry](https://swcregistry.io/), [Consensys DeFi Security Best Practices](https://consensys.github.io/smart-contract-best-practices/) e [Trail of Bits](https://blog.trailofbits.com/).

### Classificação de Severidade

| Severidade | Definição |
|------------|-----------|
| **Crítico** | Perda total de fundos ou colapso do protocolo. Exploração trivial. |
| **Alto** | Perda significativa de fundos ou quebra de funcionalidade crítica. |
| **Médio** | Perda limitada ou comportamento inesperado sob condições específicas. |
| **Baixo** | Violação de boas práticas sem perda direta. |

### Resumo dos Achados

| Severidade | Quantidade |
|------------|-----------|
| **Crítico** | 2 |
| **Alto** | 2 |
| **Médio** | 2 |
| **Baixo** | 0 |
| **Informativo** | 0 |

---

## 4. Achados Detalhados

---

### F-001: Manipulação de Oracle de Preço

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **SWC** | SWC-120 |
| **Código** | VulnerablePriceOracle.sol:16-18 |

#### Descrição

A função `setPrice()` no `VulnerablePriceOracle` é pública sem qualquer controle de acesso. Qualquer pessoa pode alterar o preço para qualquer valor arbitrário.

```solidity
function setPrice(uint256 _price) external {
    price = _price;
}
```

O contrato `VulnerableLendingPool` usa este oracle para calcular o valor do colateral e o limite de empréstimo via `_getPrice()`, que faz uma chamada `staticcall` para o oracle.

```solidity
function _getPrice() internal view returns (uint256) {
    (bool success, bytes memory data) =
        priceOracle.staticcall(abi.encodeWithSignature("getPrice()"));
    require(success, "Oracle call failed");
    return abi.decode(data, (uint256));
}
```

#### Impacto

- Um atacante pode definir o preço do colateral para um valor extremamente alto e assim emprestar muito mais do que deveria
- Ou definir o preço para ~0 e liquidar posições de outros usuários por quase nada
- Perda total dos fundos do protocolo de empréstimo

#### Prova de Conceito

```
1. Atacante deposita 1 ETH como colateral (valor real: ~$3000)
2. Atacante chama setPrice(1_000_000 ether) no oracle
3. Atacante empresta o máximo possível (agora calculado sobre colateral de $1B)
4. Atacante nunca paga o empréstimo e fica com os tokens emprestados
```

#### Causa Raiz

- Ausência de controle de acesso em `setPrice()`
- Ausência de validação de variação máxima (max deviation)
- Single point of failure: apenas um oracle para todo o protocolo

#### Recomendação

```solidity
address public owner;

modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

function setPrice(uint256 _price) external onlyOwner {
    require(_price > 0, "Price must be > 0");
    uint256 deviation = _price > price ? _price - price : price - _price;
    require(deviation <= (price * MAX_DEVIATION_BPS) / 10000, "Exceeds max deviation");
    price = _price;
    emit PriceUpdated(price);
}
```

---

### F-002: Ausência de Proteção contra Slippage no Swap

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **SWC** | SWC-120 |
| **Código** | VulnerableAMM.sol:43-53 |

#### Descrição

A função `swap()` não possui parâmetro `minAmountOut`. O valor recebido depende do saldo das reservas no momento da execução, que pode ser diferente do momento em que a transação foi assinada. Isso permite ataques de sandwich e front-running.

```solidity
function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
    require(tokenIn == address(token0) || tokenIn == address(token1), "Invalid token");
    amountOut = getAmountOut(tokenIn, amountIn);
    // ... transferências
}
```

#### Impacto

- Usuários podem receber muito menos do que o esperado devido a manipulação de mempool
- Ataques de sandwich podem extrair valor do usuário
- Perda financeira para o usuário que realiza o swap

#### Prova de Conceito

```
1. Usuário A envia swap(USDC, 1000 USDC) para trocar por ETH
2. Atacante (bot) vê a transação no mempool
3. Bot compra ETH antes (aumentando o preço)
4. Swap do usuário executa com preço pior
5. Bot vende ETH depois (lucrando com a diferença)
```

#### Causa Raiz

- Ausência de parâmetro `minAmountOut` que permitiria ao usuário definir o mínimo aceitável
- Ausência de parâmetro `deadline` que expiraria a transação após certo tempo

#### Recomendação

```solidity
function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut, uint256 deadline) external returns (uint256 amountOut) {
    require(block.timestamp <= deadline, "Expired");
    amountOut = getAmountOut(tokenIn, amountIn);
    require(amountOut >= minAmountOut, "Slippage too high");
    // ... resto do código
}
```

---

### F-003: Empréstimo sem Health Factor

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Crítico** |
| **Status** | Aberto |
| **SWC** | SWC-105 |
| **Código** | VulnerableLendingPool.sol:28-34 |

#### Descrição

A função `borrow()` calcula o máximo que um usuário pode emprestar com base no colateral e preço, mas não verifica um **health factor mínimo** após o empréstimo. Além disso, `seizeCollateral()` permite que qualquer pessoa tome o colateral de outro usuário sem verificar se a posição está liquidável.

```solidity
function borrow(uint256 amount) external {
    uint256 price = _getPrice();
    uint256 maxBorrow = (collateralOf[msg.sender] * price * LTV_PRECISION) / (1e18 * 100);
    require(amount <= maxBorrow, "Borrow exceeds max");
    debtOf[msg.sender] += amount;
    borrowToken.transfer(msg.sender, amount);
}
```

#### Impacto

- Usuários podem emprestar até 110% do valor do colateral (LTV_PRECISION = 110)
- Se o preço do colateral cair, ninguém pode ser liquidado automaticamente
- Posições undercollateralized podem existir sem consequências
- `seizeCollateral()` pode ser chamado por qualquer um a qualquer momento, sem verificação de saúde da posição

#### Prova de Conceito

```
1. Atacante deposita $100 de colateral
2. Atacante empresta $110 (LTV=110%)
3. Preço do colateral cai para $50
4. Posição está undercollateralized mas ninguém pode liquidar eficientemente
5. Ou: alguém chama seizeCollateral() mesmo sem a posição estar liquidável
```

#### Causa Raiz

- LTV máximo muito alto (110%)
- Ausência de verificação `require(healthFactor > 1)` após o empréstimo
- Ausência de função de liquidação com verificação de health factor
- `seizeCollateral()` sem verificação de insolvência

#### Recomendação

```solidity
uint256 public constant MAX_LTV_BPS = 7500; // 75%
uint256 public constant LIQUIDATION_THRESHOLD_BPS = 8000; // 80%
uint256 public constant MIN_HEALTH_FACTOR = 1.5 ether;

function borrow(uint256 amount) external {
    uint256 price = _getPrice();
    uint256 maxBorrow = (collateralOf[msg.sender] * price * MAX_LTV_BPS) / (1e18 * 10000);
    require(amount <= maxBorrow, "Borrow exceeds max");
    debtOf[msg.sender] += amount;
    require(getHealthFactor(msg.sender) >= MIN_HEALTH_FACTOR, "Health factor too low");
    borrowToken.transfer(msg.sender, amount);
}

function liquidate(address user) external {
    require(getHealthFactor(user) < 1 ether, "Not liquidatable");
    // liquidar posição com bonus
}
```

---

### F-004: Ataque de Replay na Bridge

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Alto** |
| **Status** | Aberto |
| **SWC** | SWC-121 |
| **Código** | VulnerableBridge.sol:34-40 |

#### Descrição

A função `mintWrapped()` não possui mecanismo para evitar que a mesma mensagem seja processada múltiplas vezes. Não há mapping de mensagens processadas, nonce ou chain ID.

```solidity
function mintWrapped(bytes calldata message, bytes calldata) external onlyValidator {
    (address originalToken, uint256 amount, address to) =
        abi.decode(message, (address, uint256, amount));
    wrappedToken.transfer(to, amount);
    wrappedSupply[originalToken] += amount;
    emit Mint(message);
}
```

#### Impacto

- A mesma mensagem de lock pode ser usada para mintar wrapped tokens infinitas vezes
- Inflação completa do wrapped token
- Perda de fundos na chain de destino

#### Prova de Conceito

```
1. Atacante faz lock de 1 ETH na chain origem (mensagem M1)
2. Validador processa M1 e minteia 1 wrapped ETH
3. Atacante reenvia M1 (mesma mensagem) ao validador
4. Validador processa M1 novamente e minteia outro wrapped ETH
5. Repetir até drenar o pool de liquidez
```

#### Causa Raiz

- Ausência de `mapping(bytes32 => bool) public processedMessages`
- Ausência de nonce incremental na mensagem
- Ausência de chain ID para evitar replay cross-chain

#### Recomendação

```solidity
mapping(bytes32 => bool) public processedMessages;
uint256 public nonce;

function mintWrapped(bytes calldata message, bytes calldata signature) external onlyValidator {
    bytes32 messageHash = keccak256(message);
    require(!processedMessages[messageHash], "Already processed");
    processedMessages[messageHash] = true;
    // ... resto
}
```

---

### F-005: Mint de Stablecoin sem Colateralização Mínima

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Médio** |
| **Status** | Aberto |
| **SWC** | SWC-105 |
| **Código** | VulnerableStablecoin.sol:31-37 |

#### Descrição

A função `mint()` permite que um usuário mint stablecoins contra seu colateral, mas o ratio de colateralização efetivo pode cair abaixo de 100% se o preço do colateral cair após o depósito. Não há verificação de colateralização mínima no momento do mint nem manutenção contínua.

```solidity
function mint(uint256 amount) external {
    uint256 price = _getPrice();
    uint256 maxMint = (depositedCollateral[msg.sender] * price * 200) / (1e18 * 100);
    require(amount <= maxMint, "Exceeds max mint amount");
    totalSupply += amount;
    balanceOf[msg.sender] += amount;
}
```

#### Impacto

- O ratio de 200% (LTV de 50%) no mint é razoável, mas se o preço do colateral cai, a stablecoin fica undercollateralized
- Não há mecanismo para liquidar posições undercollateralized
- Perda de confiança na stablecoin, potencial death spiral

#### Causa Raiz

- Ausência de circuit breaker por queda de preço
- Ausência de limite de supply total
- Ausência de mecanismo de liquidação

#### Recomendação

```solidity
uint256 public constant MIN_COLLATERAL_RATIO_BPS = 15000; // 150%
uint256 public supplyCap = 1_000_000 ether;

function mint(uint256 amount) external {
    require(totalSupply + amount <= supplyCap, "Supply cap exceeded");
    uint256 price = _getPrice();
    uint256 maxMint = (depositedCollateral[msg.sender] * price * 10000) / (1e18 * MIN_COLLATERAL_RATIO_BPS);
    require(amount <= maxMint, "Exceeds max mint amount");
    require(_getCollateralRatio(msg.sender) >= MIN_COLLATERAL_RATIO_BPS, "Collateral ratio too low");
    totalSupply += amount;
    balanceOf[msg.sender] += amount;
}

function _getCollateralRatio(address user) internal view returns (uint256) {
    uint256 collateralValue = depositedCollateral[user] * _getPrice() / 1e18;
    if (totalSupply == 0) return type(uint256).max;
    return (collateralValue * 10000) / totalSupply;
}
```

---

### F-006: Ausência de Oracle com TWAP no AMM

| Campo | Detalhe |
|-------|---------|
| **Severidade** | **Médio** |
| **Status** | Aberto |
| **SWC** | SWC-120 |
| **Código** | VulnerableAMM.sol:70-72 |

#### Descrição

O `VulnerableAMM` expõe uma função `getPrice()` que retorna o preço spot da pool (`getReserve1() / getReserve0()`). Este preço spot pode ser facilmente manipulado por flash loans ou por grandes swaps em uma única transação.

```solidity
function getPrice() external view returns (uint256) {
    return getReserve1() / getReserve0();
}
```

#### Impacto

Se algum protocolo usar este preço spot para valuation (como o VulnerableLendingPool ou VulnerableStablecoin), um atacante pode:
1. Manipular as reservas do AMM com um flash loan
2. Distorcer o preço spot por uma transação
3. Extrair valor do protocolo que confia neste preço

#### Causa Raiz

- Preço spot sem TWAP (Time-Weighted Average Price)
- Ausência de cumuladores de preço
- Manipulável por flash loan

#### Recomendação

```solidity
uint256 public price0Cumulative;
uint256 public price1Cumulative;
uint256 public blockTimestampLast;

function _update(uint256 balance0, uint256 balance1) internal {
    uint256 timeElapsed = block.timestamp - blockTimestampLast;
    if (timeElapsed > 0 && balance0 > 0 && balance1 > 0) {
        price0Cumulative += (balance1 * 1e18 / balance0) * timeElapsed;
        price1Cumulative += (balance0 * 1e18 / balance1) * timeElapsed;
    }
    blockTimestampLast = block.timestamp;
}
```

---

## 5. Recomendações Prioritárias

| Prioridade | Recomendação | Achados |
|------------|-------------|---------|
| P-01 | Adicionar controle de acesso e validação de desvio no oracle | F-001 |
| P-02 | Implementar health factor mínimo e liquidação automática | F-003 |
| P-03 | Adicionar minAmountOut e deadline no swap | F-002 |
| P-04 | Implementar replay protection na bridge | F-004 |
| P-05 | Adicionar supply cap e circuit breaker na stablecoin | F-005 |
| P-06 | Implementar TWAP oracle no AMM | F-006 |

---

## 6. Sumário de Reteste

| ID | Achado | Severidade | Status |
|----|--------|-----------|--------|
| F-001 | Oracle Manipulation | Crítico | Aberto |
| F-002 | Missing Slippage | Alto | Aberto |
| F-003 | No Health Factor | Crítico | Aberto |
| F-004 | Bridge Replay | Alto | Aberto |
| F-005 | Undercollateralized Mint | Médio | Aberto |
| F-006 | No TWAP Oracle | Médio | Aberto |

---

## 7. Apêndices

### Referências

- [SWC-120: Weak Sources of Randomness](https://swcregistry.io/docs/SWC-120)
- [SWC-105: Unprotected Ether Withdrawal](https://swcregistry.io/docs/SWC-105)
- [SWC-121: Missing Protection Against Signature Replay Attacks](https://swcregistry.io/docs/SWC-121)
- [Uniswap V2 TWAP Oracle](https://docs.uniswap.org/contracts/v2/concepts/core-concepts/oracles)
- [Chainlink Price Feeds](https://docs.chain.link/data-feeds/price-feeds/)
- [Aave Protocol Security](https://docs.aave.com/developers/security)

---

**CryptoSec Lab**  
Contato: security@cryptoseclab.com
