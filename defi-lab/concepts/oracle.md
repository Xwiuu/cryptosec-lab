# Oracle de Preços

## O Que É

Um **Oracle de Preços** é um serviço que traz dados do mundo real (neste caso, preços de ativos) para dentro da blockchain. Protocolos DeFi dependem de oracles para saber quanto vale um ativo na hora de emprestar, liquidar ou trocar. Sem oracles confiáveis, contratos inteligentes ficariam isolados de informações externas.

## Como Funciona Tecnicamente

### Spot Price vs TWAP

| Tipo | Descrição | Risco |
|:---|---:|---:|
| **Spot Price** | Preço instantâneo de uma fonte (ex.: uma DEX). | Fácil de manipular com flash loans. |
| **TWAP** (Time-Weighted Average Price) | Média de preços ao longo de um período (ex.: 30 minutos). | Mais resistente a manipulação, mas menos responsivo. |

### Mediana

O **preço mediano** é coletado de múltiplas fontes independentes (ex.: Binance, Coinbase, Kraken). A mediana reduz o impacto de uma única fonte com preço anômalo.

```
Preço Final = mediana(preço_Binance, preço_Coinbase, preço_Kraken, preço_Uniswap)
```

### Heartbeat e Stale Price

- **Heartbeat**: intervalo regular em que o oracle atualiza o preço on-chain (ex.: Chainlink atualiza a cada ~20 minutos ou se o desvio > 0,5%).
- **Stale Price**: preço que não foi atualizado dentro do heartbeat esperado — protocolos devem rejeitar preços obsoletos (stale) para evitar liquidações injustas.

### Max Deviation

Limite percentual máximo de variação entre uma atualização e a anterior. Se o desvio excede esse limite, o update é rejeitado ou exigem-se múltiplas confirmações.

### Fontes de Dados

1. **CEX APIs**: Binance, Coinbase, Kraken (via servidores centralizados).
2. **DEX Pools**: Uniswap, Curve (preços on-chain).
3. **Agregadores**: Chainlink, RedStone, Pyth — consolidam múltiplas fontes.

### Chainlink

Chainlink é o oracle mais usado em DeFi. Seu modelo:

- **Rede de Nós**: operadores independentes rodam nodes que buscam preços de exchanges.
- **Aggregation Contract**: coleta os relatos dos nós e publica a mediana.
- **Feed Registry**: contratos de feed de preço (ex.: `ETH/USD`) que qualquer protocolo pode consultar.

## Exemplo

1. O protocolo Aave precisa saber o preço do ETH para calcular health factors.
2. Aave consulta o feed `ETH/USD` do Chainlink que retorna US$ 2.000.
3. O usuário com 10 ETH de colateral e 15.000 USDC de dívida tem `health factor = (10 × 2.000 × 0,85) / 15.000 = 1,13`.
4. Se o feed desce para US$ 1.800, o health factor cai para 1,02 — próxima de liquidação.

## Risco

- **Manipulação de Oracle**: atacantes usam flash loans para distorcer o preço spot de uma DEX e enganar protocolos que usam esse preço sem TWAP — ataque clássico (ex.: ataque ao bZx em 2020, Mango Markets em 2022).
- **Stale Price**: se o oracle não atualiza durante volatilidade, o protocolo opera com preço desatualizado, permitindo arbitragem ou liquidações indevidas.
- **Falta de Diversidade**: usar uma única fonte de preço centralizada (ex.: só Binance) é um ponto único de falha.
- **Desvio Súbito**: flash crashes em exchanges podem causar picos nos feeds se o oracle não usa mediana ou TWAP.

## Mitigação

- **Usar TWAP em vez de Spot**: Uniswap V2/V3 oferecem TWAP como ferramenta nativa, mais resistente a manipulação instantânea.
- **Múltiplos Oracles**: usar Chainlink + RedStone + Pyth simultaneamente e tirar mediana.
- **Verificar Staleness**: configurar um timeout (ex.: rejeitar preço se timestamp > 2 horas).
- **Max Deviation Checks**: bloquear atualizações com variação anormal entre blocks consecutivos.
- **Circuit Breaker**: pausar empréstimos/liquidações se o oracle reportar valores fora de faixa esperada.
