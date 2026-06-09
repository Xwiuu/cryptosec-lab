# Simulação de Price Manipulation

## Contexto

Esta simulação demonstra como um atacante pode manipular o preço _spot_ de uma AMM com reservas rasas para explorar um protocolo dependente desse preço. O cenário envolve uma pool Uniswap V2 com baixa liquidez (10 ETH / 10.000 USDC) e um contrato de lending que consulta o preço spot da pool como fonte de verdade para calcular o valor do colateral.

## Pré-condições

- Pool AMM com liquidez total de ~$20.000.
- Contrato de lending (`VulnerableLendingPool`) utiliza o método `getReserves()` da pool como oráculo, sem TWAP.
- Atacante possui acesso a um flash loan de pelo menos 100 ETH (capital suficiente para drenar a pool).

## Passo a Passo

1. O atacante solicita um flash loan de 100 ETH do contrato `VulnerableFlashLoanPool`.
2. Com os 100 ETH, realiza um swap na pool alvo, comprando a maioria dos USDC da reserva. A pool passa de (10 ETH, 10.000 USDC) para (110 ETH, ~909 USDC) — o preço do ETH cai artificialmente naquela pool.
3. O contrato de lending consulta o preço spot — o ETH agora aparece a ~$8,26 em vez de $1.000.
4. O atacante deposita 1 ETH como colateral, que o protocolo avalia como sendo de baixo valor (devido ao preço manipulado para baixo).
5. Na verdade, o ataque também pode ser feito para **inflar** um ativo: swap de ETH para USDC, esvaziando o ETH da pool, fazendo o preço do USDC disparar.
6. Após o exploit, o atacante devolve o flash loan e realiza o lucro.

## Impacto

Na simulação, uma manipulação de 100 ETH resulta em um desvio de preço de ~99%, permitindo que o atacante empreste ~5x mais do que deveria com o mesmo colateral. O protocolo fica com _bad debt_ de aproximadamente $8.000.

## Mitigação

A simulação compara o mesmo cenário com `SecureAMM.sol`, que utiliza TWAP de 30 minutos. Com TWAP, o preço manipulado em um único bloco é suavizado, e o ataque se torna inviável — o contrato de lending consulta o preço médio, não o preço spot manipulado.
