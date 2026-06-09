# Simulação de Impermanent Loss

## Contexto

Esta simulação calcula e demonstra a perda impermanente (IL) para diferentes cenários de variação de preço em uma pool AMM de produto constante (Uniswap V2). A simulação utiliza `ImpermanentLossSimulation.t.sol` para comparar o valor de uma posição de LP versus o valor de simplesmente segurar os ativos (HODL) em diferentes condições de mercado.

## Pré-condições

- Pool Uniswap V2 com par ETH/USDC.
- LP deposita 10 ETH e 10.000 USDC (preço inicial: 1 ETH = 1.000 USDC).
- Simulação calcula o valor da posição em múltiplos cenários de preço.

## Cenários Simulados

### Cenário 1: ETH sobe para $2.000 (r = 2)

| Medida | Valor |
|--------|-------|
| Valor HODL | 10 ETH × $2.000 + 10.000 USDC = $30.000 |
| Valor LP | ~14.142 ETH × $2.000 + ~7.071 USDC = ~$28.284 |
| IL | -$1.716 (-5,72%) |

### Cenário 2: ETH cai para $500 (r = 0,5)

| Medida | Valor |
|--------|-------|
| Valor HODL | 10 ETH × $500 + 10.000 USDC = $15.000 |
| Valor LP | ~7.071 ETH × $500 + ~14.142 USDC = ~$17.678 |
| IL | -$1.678 (-5,72%) |

Nota: a IL é simétrica — a perda percentual é a mesma para subida ou descida de mesmo fator.

### Cenário 3: ETH sobe para $5.000 (r = 5)

| Medida | Valor |
|--------|-------|
| Valor HODL | 10 ETH × $5.000 + 10.000 USDC = $60.000 |
| Valor LP | ~4.472 ETH × $5.000 + ~22.361 USDC = ~$44.721 |
| IL | -$15.279 (-25,46%) |

### Cenário 4: Variação pequena — ETH vai para $1.100 (r = 1,1)

| Medida | Valor |
|--------|-------|
| Valor HODL | 10 ETH × $1.100 + 10.000 USDC = $21.000 |
| Valor LP | ~9.535 ETH × $1.100 + ~10.488 USDC = ~$20.952 |
| IL | -$48 (-0,23%) |

## Análise de Fees

A simulação também calcula quantas taxas de negociação seriam necessárias para compensar o IL:

- Para r = 2 (IL = 5,72%), seriam necessárias ~$1.716 em taxas acumuladas.
- Com volume diário de $50.000 na pool e taxa de 0,3%, o LP ganharia ~$150/dia em fees (para uma pool de $200.000). Seriam necessários ~11,4 dias para compensar o IL.

## Impacto

A perda impermanente reduz o retorno do LP em comparação com simplesmente segurar os ativos. Em mercados voláteis, o IL pode superar os ganhos com taxas, resultando em prejuízo líquido para o provedor de liquidez.

## Mitigação

A simulação demonstra que:
- **Stablecoin pools** (ex.: USDC/USDT) têm IL desprezível (r ≈ 1, IL ≈ 0%).
- **Concentrated liquidity** (Uniswap V3) permite concentrar liquidez em uma faixa de preço, mas amplifica o IL se o preço sair da faixa.
- **Pools com alta taxa de volume** podem compensar o IL com fees.
- **Hedging** com futuros perpétuos pode neutralizar o risco de preço, mas requer custo adicional.
