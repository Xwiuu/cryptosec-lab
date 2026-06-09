# AMM — Automated Market Maker

## O Que É

Um **Automated Market Maker (AMM)** é um tipo de exchange descentralizada (DEX) que usa um algoritmo matemático para precificar ativos automaticamente, sem depender de uma carteira de ordens (order book). Em vez de compradores e vendedores combinando ordens, os usuários negociam diretamente contra um pool de liquidez.

## Como Funciona Tecnicamente

### Fórmula do Produto Constante — `x * y = k`

O modelo mais comum é o **Constant Product Market Maker** (popularizado pelo Uniswap):

```
x * y = k
```

Onde:
- `x` = quantidade do ativo X no pool
- `y` = quantidade do ativo Y no pool
- `k` = constante (o produto total permanece invariável)

Quando um usuário compra X (removendo X do pool), ele precisa depositar Y suficiente para que `x * y` continue igual a `k`.

### Determinação de Preço

O preço é definido pela **razão das reservas**:

```
Preço de X em Y = y / x
```

Exemplo: se o pool tem 100 ETH e 200.000 USDC, o preço do ETH é 2.000 USDC.

### Slippage

Quanto maior o trade em relação ao tamanho do pool, maior o **slippage** (desvio do preço esperado). Isso ocorre porque mover a razão das reservas altera o preço na própria transação.

### LP Tokens e Taxas

- Provedores de liquidez (LPs) depositam pares de ativos e recebem **LP tokens** que representam sua participação no pool.
- Cada trade paga uma taxa (ex.: 0,3%) que é redistribuída proporcionalmente aos LPs.
- LP tokens podem ser queimados para resgatar os ativos subjacentes + taxas acumuladas.

### Comparação com Order Books

| Característica | AMM | Order Book |
|:---|---:|---:|
| Liquidez | Sempre disponível | Depende de matched orders |
| Custódia | Autocustódia (via smart contract) | Exchange centralizada |
| Precificação | Algorítmica | Ofertas de compra/venda |
| Taxas | % fixa por trade | Spread + comissão |

## Exemplo

1. Alice deposita 1 ETH e 2.000 USDC em um pool (k = 1 × 2000 = 2000).
2. Bob quer comprar 0,1 ETH. Ele deposita USDC até que `0,9 * y' = 2000`, logo `y' = 2222,22 USDC`.
3. Bob paga 222,22 USDC por 0,1 ETH — preço médio de ~2.222 USDC (acima dos 2.000 iniciais devido ao slippage).
4. A taxa de 0,3% sobre o trade é adicionada ao pool, aumentando k ligeiramente.

## Risco

- **Impermanent Loss**: perda temporária causada pela volatilidade do preço dos ativos no pool comparado a simplesmente segurar os ativos fora do pool.
- **Slippage Elevado**: pools com baixa liquidez causam perdas significativas em trades grandes.
- **Rug Pull**: criadores do pool podem remover liquidez abruptamente (em pools falsos ou não auditados).
- **Manipulação de Preço**: ataques via flash loan podem distorcer temporariamente a razão das reservas.

## Mitigação

- **Pools Estáveis** (StableSwap): usam curva de precificação diferente para ativos correlacionados (ex.: USDC/USDT), reduzindo impermanent loss.
- **Liquidez Concentrada**: permite que LPs escolham faixas de preço específicas (ex.: Uniswap V3), otimizando capital.
- **Auditorias e Pools Verificados**: negociar apenas em pools auditados por empresas como Trail of Bits, Consensys Diligence, etc.
- **Slippage Tolerance**: configurar tolerância máxima na interface antes de assinar a transação.
