# Simulação de Liquidity Rug Pull

## Contexto

Esta simulação recria um rug pull clássico em uma AMM. O atacante cria um token fraudulento, adiciona liquidez com ETH, promove o token para atrair compradores e remove toda a liquidez de uma só vez, fazendo o preço colapsar para zero.

## Pré-condições

- Token `RUG` recém-criado (sem auditoria, sem locks).
- Pool Uniswap V2 `RUG/ETH` com liquidez inicial de 10 ETH + 100.000 RUG.
- Preço inicial: 1 ETH = 10.000 RUG (1 RUG = $0,0002 com ETH a $2.000).
- Atacante controla o contrato do token e a liquidez.

## Passo a Passo

1. O atacante cria o token `RUG.sol` com supply total de 1.000.000.000 (1 bilhão).
2. Cria o par `RUG/ETH` na Uniswap V2 e adiciona liquidez inicial:
   - 10 ETH + 100.000 RUG (0,01% do supply).
   - Recebe tokens LP representando 100% da pool.
3. Promove o token em canais sociais: Twitter, Telegram, Discord.
   - Promessas de parcerias falsas, auditores falsos, roadmap irreal.
4. Investidores compram: 20 ETH entram na pool ao longo de 2 dias.
   - Reservas da pool: 30 ETH + ~76.923 RUG.
   - Preço: 1 ETH = ~2.564 RUG (valorização de ~290%).
5. O atacante decide que é o momento certo. Remove toda a liquidez:
   - Chama `removeLiquidity(10 ETH + taxa acumulada)`.
   - Piscina vai de (30 ETH, ~76.923 RUG) para (~20 ETH do atacante + taxa, ~76.923 RUG).
   - Na verdade, a remoção de liquidez queima os tokens LP do atacante, e ele recebe sua parte proporcional das reservas.
6. Com a liquidez drasticamente reduzida, o preço do RUG colapsa.
7. Investidores tentam vender, mas não há liquidez — preço vai a zero.

## Impacto

Investidores perdem ~20 ETH (~$40.000). O atacante lucra ~20 ETH (investimento inicial de 10 ETH + lucro de ~10 ETH das taxas e valorização). O token RUG torna-se inegociável. Centenas de pequenos investidores perdem seu capital.

## Mitigação

A simulação demonstra o efeito de um **_liquidity lock_** (via contrato como Unicrypt): se o atacante bloqueia os tokens LP por 1 ano, ele não pode remover a liquidez antes do prazo. Investidores podem verificar se a liquidez está bloqueada antes de comprar. A simulação com `LiquidityLockSimulation` mostra que, com lock ativo, o rug pull é impedido — o atacante não consegue chamar `removeLiquidity` porque os tokens LP estão em um contrato de lock.
