# Simulação de Liquidation Attack

## Contexto

Esta simulação demonstra como um motor de liquidação vulnerável pode permitir a liquidação de posições saudáveis. O cenário utiliza `VulnerableLiquidationEngine.sol`, que calcula o health factor com base em um oráculo spot manipulável, e um bônus de liquidação de 20%.

## Pré-condições

- Protocolo de lending com posições abertas de diversos usuários.
- Motor de liquidação (`VulnerableLiquidationEngine`) consulta oráculo spot sem TWAP.
- Bônus de liquidação: 20% (excessivo).
- Atacante possui capital para executar liquidações.

## Passo a Passo

1. Um usuário legítimo tem uma posição aberta: deposita 10 ETH como colateral, empresta 5.000 USDC. Com ETH a $2.000, o colateral vale $20.000 e o LTV é 25% — health factor saudável (> 2,0).
2. O atacante manipula o oráculo spot: realiza um swap que derruba artificialmente o preço do ETH na pool que serve de oráculo.
3. O oráculo spot agora reporta ETH a $1.200 (queda de 40%).
4. O motor de liquidação calcula o novo health factor da posição:
   - Colateral: 10 ETH × $1.200 = $12.000.
   - Dívida: $5.000.
   - Health factor: 12.000 / (5.000 × 1,25) = 1,92 → ainda saudável (acima de 1). O ataque falha nesta configuração.
5. O atacante então manipula o preço para uma queda de 60% (ETH a $800):
   - Colateral: 10 ETH × $800 = $8.000.
   - Health factor: 8.000 / (5.000 × 1,25) = 1,28 → abaixo de 1,5, liquidável.
6. O atacante liquida a posição: paga $5.000 da dívida, recebe 10 ETH × 1,2 = 12 ETH (bônus de 20%).
7. O mercado retorna ao normal. O atacante vende os 2 ETH extras de bônus — lucro de ~$4.000.

## Impacto

A vítima perde 10 ETH de colateral por uma dívida de apenas $5.000, com uma queda artificial que durou apenas um bloco. Sem a manipulação, a posição permaneceria saudável.

## Mitigação

A simulação com `SecureLiquidationEngine` (que utiliza TWAP + Chainlink) impede o ataque: mesmo com manipulação spot, o TWAP não se desvia o suficiente para tornar a posição liquidável. Além disso, o bônus reduzido para 8% torna a liquidação forçada menos lucrativa e desincentiva o ataque.
