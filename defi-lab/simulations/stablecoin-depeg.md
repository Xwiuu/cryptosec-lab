# Simulação de Stablecoin Depeg

## Contexto

Esta simulação demonstra o ataque de descolamento (depeg) de uma stablecoin algorítmica que utiliza um oráculo de preço spot para calcular o valor do colateral e determinar quantas stablecoins podem ser cunhadas. O cenário utiliza `VulnerableStablecoin.sol` com min collateral ratio de 110%.

## Pré-condições

- Stablecoin com MCR de 110% (extremamente baixo, alta alavancagem permitida).
- Oráculo spot baseado em pool AMM com reservas rasas (5 ETH / 50.000 USDC).
- Mercado externo com liquidez de $100.000 para a stablecoin.

## Passo a Passo

1. O atacante deposita 1 ETH como colateral (valor real: $2.000).
2. Manipula a AMM: com 50 ETH obtidos via flash loan, compra todo o USDC da pool. A pool vai de (5 ETH, 50.000 USDC) para (55 ETH, ~4.545 USDC). Preço do ETH na pool cai de $10.000 para ~$82.
3. O oráculo spot reporta ETH a $82 (incorreto, mas o contrato usa esse preço).
4. O atacante agora deposita mais ETH — mas o oráculo está baixo, então ele não consegue cunhar muito.
5. Na verdade, a estratégia correta é **inflar** o preço do ativo colateral, não derrubá-lo. Então o atacante faz o oposto: compra todo o ETH da pool com USDC, fazendo o ETH subir artificialmente.
   - Pool: (5 ETH, 50.000 USDC). O atacante compra 4 ETH por 40.000 USDC. Pool vai para (1 ETH, 90.000 USDC). Preço spot do ETH = 90.000 USDC/ETH.
6. O oráculo spot reporta ETH a $90.000.
7. O atacante deposita 1 ETH (valor real: $2.000) — o contrato avalia como $90.000.
8. Com MCR de 110%, o atacante pode cunhar até 90.000 / 1,1 = ~81.818 stablecoins.
9. O atacante vende as 81.818 stablecoins no mercado por ~$81.818 em USDC.
10. A venda massiva derruba o preço da stablecoin para $0,85 (depeg de 15%).

## Impacto

A stablecoin perde a paridade com o dólar. Outros usuários entram em pânico e vendem, aprofundando o depeg. O atacante lucra ~$81.818 (menos o custo do flash loan e taxas). Os detentores da stablecoin sofrem perda de 15%+.

## Mitigação

A simulação com MCR de 150% + TWAP de 1 hora impede o ataque: o colateral de 1 ETH é avaliado a ~$2.000 (preço TWAP), permitindo cunhar apenas ~1.333 stablecoins — insuficiente para causar depeg significativo.
