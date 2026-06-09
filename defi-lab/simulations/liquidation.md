# Liquidation Attack

## Contexto
Em protocolos de lending, posicoes sub-colateralizadas podem ser liquidadas.

## Execucao do Atacante

1. Depositar collateral (ETH)
2. Tomar emprestimo maximo (USDC)
3. Manipular preco do ETH para baixo (via flash loan + pool fina)
4. Health factor cai abaixo do threshold
5. Liquidar a propria posicao (ou de terceiros)
6. Receber collateral com bonus
7. Preco volta ao normal

## Impacto
- Liquidacoes indevidas
- Perda para usuarios legitimos
- Bonus de liquidacao drena o protocolo

## Mitigacao
- Oracle descentralizado
- TWAP resistente a manipulacao
- Limites de variacao de preco
- Health factor conservador
