# Impermanent Loss — Perda Impermanente

## O Que É

**Impermanent Loss (IL)** ou **Perda Impermanente** é a perda financeira que provedores de liquidez (LPs) sofrem quando o preço relativo dos ativos no pool muda em relação ao momento do depósito. Ela é chamada de "impermanente" porque, se o preço retornar ao valor original, a perda desaparece. Porém, se o LP retira enquanto o preço está diferente, a perda se torna permanente.

## Como Funciona Tecnicamente

### Causa Raiz

AMMs com produto constante (`x * y = k`) obrigam os LPs a manter uma proporção fixa entre os ativos. Quando o preço de mercado se desvia, arbitradores negociam contra o pool até que o preço interno do AMM corresponda ao mercado. Isso faz com que o pool tenha mais do ativo que desvalorizou e menos do que valorizou — resultando em menos valor total do que simplesmente segurar os dois ativos fora do pool.

### Cálculo Matemático

A perda impermanente pode ser calculada pela razão de preço entre o momento do depósito e o momento atual:

```
IL = 2√r / (1 + r) − 1
```

Onde `r = P_novo / P_original` (razão de preço).

| Rácio de Preço (r) | Perda Impermanente |
|:---|---:|
| 1,25 | 0,60% |
| 1,50 | 2,02% |
| 1,75 | 3,77% |
| 2,00 | 5,72% |
| 2,50 | 9,09% |
| 3,00 | 11,80% |
| 4,00 | 17,15% |

A fórmula mostra que a IL é **simétrica**: o mesmo percentual de perda ocorre se o preço dobra ou cai pela metade.

## Exemplo com Números

1. Alice deposita **1 ETH e 100 USDC** em um pool quando 1 ETH = 100 USDC.
   - Valor total: 200 USDC.
2. O preço do ETH sobe para 400 USDC.
3. Arbitradores compram ETH barato do pool até o preço do pool igualar 400 USDC.
4. Após rebalanceamento, Alice tem: **0,5 ETH e 200 USDC** (pela fórmula `x * y = k`).
   - Valor total: 0,5 × 400 + 200 = 400 USDC.
5. Se Alice tivesse apenas **segurado** os 1 ETH + 100 USDC:
   - Valor: 1 × 400 + 100 = 500 USDC.
6. **Perda Impermanente**: 500 − 400 = 100 USDC (20% do valor se apenas segurasse).

## Quando Ocorre

A IL ocorre sempre que há **volatilidade de preço** entre os ativos do pool:

- **Pools de ativos voláteis**: ETH/USDC, BTC/ETH — maior IL.
- **Pools estáveis**: USDC/USDT, DAI/USDC — IL mínima, pois os preços são quase sempre iguais.
- **Pools de liquidez concentrada** (Uniswap V3): a IL pode ser ainda maior se o preço sair da faixa escolhida pelo LP.

## Mitigação

- **Taxas de Negociação**: as taxas acumuladas ao longo do tempo podem compensar parcial ou totalmente a IL. Pools com alto volume diário geram mais taxas para os LPs.
- **Pools de Ativos Estáveis**: USDC/USDT ou DAI/sDAI têm IL virtualmente zero (preços correlacionados).
- **Yield Farming com Recompensas**: tokens de governança extras (ex.: CAKE, SUSHI) ajudam a contrabalançar IL.
- **Liquidez Concentrada Conservadora**: no Uniswap V3, escolher faixas amplas reduz o risco de sair da faixa (mas também reduz eficiência de capital).
- **Ferramentas de Hedge**: fazer hedge do ativo volátil separadamente (ex.: vender futuros perpétuos de ETH na mesma proporção do pool).
- **Escolher Períodos de Baixa Volatilidade**: prover liquidez em mercados calmos reduz exposição à IL.
