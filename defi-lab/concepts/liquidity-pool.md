# Liquidity Pool

## O Que É

Um **Liquidity Pool** é um conjunto de fundos bloqueados em um smart contract que fornece liquidez para negociações, empréstimos ou outras operações em protocolos DeFi. Diferente de exchanges tradicionais (que dependem de market makers), os pools dependem de provedores de liquidez (LPs) que depositam seus ativos e ganham taxas em troca.

## Como Funciona Tecnicamente

### Liquidez em DeFi

Em DeFi, liquidez é a disponibilidade de ativos em um protocolo para que usuários possam trocar, emprestar ou pedir emprestado sem atraso. Quanto maior o pool, menor o slippage e mais eficiente o mercado.

### Provedores de Liquidez (LPs)

1. Um LP deposita dois ativos em proporções iguais (em valor) no pool.
2. O pool emite **LP Shares** (ou LP tokens) — tokens ERC-20 que representam a propriedade proporcional do pool.
3. Cada trade no pool gera taxa; essa taxa é acumulada no pool, aumentando o valor de cada LP share.
4. O LP pode queimar seus shares a qualquer momento para resgatar sua parte dos ativos + taxas.

### Remoção de Liquidez

Ao remover liquidez, o LP recebe uma fatia proporcional de **ambos os ativos** (não apenas um). A composição exata depende da razão atual das reservas no momento da retirada.

```
ativos_retirados_X = (shares_queimados / total_shares) * reserva_X
ativos_retirados_Y = (shares_queimados / total_shares) * reserva_Y
```

### Tipos de Pool

- **Pool de Negociação**: usado por DEXs (Uniswap, Curve, Balancer).
- **Pool de Empréstimos**: usado por lending protocols (Aave, Compound) — depositantes emprestam para tomadores.
- **Pool de Stablecoins**: focado em ativos com preço estável (Curve, Frax).

## Exemplo

1. Um LP deposita 10 ETH e 20.000 USDC (razão 1 ETH = 2.000 USDC) em um pool.
2. Recebe 1.000 LP tokens representando sua participação.
3. Após uma semana de trades, as taxas acumuladas fazem os LP tokens valerem 10,5 ETH + 21.000 USDC.
4. O LP queima seus 1.000 tokens e recebe os ativos proporcionais de volta.

## Risco

- **Impermanent Loss**: se o preço relativo entre os ativos mudar, o LP pode ter menos valor do que se tivesse apenas segurando os ativos fora do pool.
- **Rug Pull**: criadores maliciosos criam pools falsos e removem toda liquidez de uma vez — comum em tokens recém-lançados sem auditoria.
- **Peg Temporário**: pools de stablecoins podem perder paridade durante eventos extremos (ex.: USDC desancorado em março de 2023).
- **Risco de Smart Contract**: bugs no contrato do pool podem levar à perda total dos fundos.

## Mitigação

- **Auditar o Contrato**: verificar se o pool passou por auditoria de segurança por empresa reconhecida.
- **Analisar Liquidez Total**: pools muito pequenos têm maior risco de slippage e manipulação.
- **Diversificar entre Pools**: não concentrar capital em um único pool para diluir risco de contratos maliciosos.
- **Ferramentas de Análise**: usar dashboards como DexScreener, DeFiLlama ou Dune Analytics para monitorar saúde do pool.
- **Liquidez Bloqueada (Locked Liquidity)**: preferir pools onde a liquidez está bloqueada por um período, reduzindo risco de rug pull.
