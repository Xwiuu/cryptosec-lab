# Oracle

## O que e

Bridge entre dados off-chain e on-chain. Providencia precos, dados climaticos, resultados esportivos, etc. para smart contracts.

## Tipos

### Centralizado
- Unico provedor de dados
- **Risco:** Ponto unico de falha, manipulacao

### Descentralizado (Chainlink)
- Multiplos provedores independentes
- Mediana dos precos
- Agregacao on-chain
- Rede de oraculos com reputacao

### TWAP (Time-Weighted Average Price)
- Preco medio ao longo do tempo
- Resistente a manipulacao de curto prazo
- Usado em Uniswap V2/V3

## Riscos

1. **Price Manipulation**: Atacante manipula preco via flash loan
2. **Stale Price**: Oracle nao atualizado
3. **Single Source**: Ponto unico de falha
4. **Front-running**: Atacante ve atualizacao e executa antes
5. **Liquidation Attack**: Manipula preco para liquidar posicoes
