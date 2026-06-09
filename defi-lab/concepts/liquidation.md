# Liquidação em DeFi

## O Que É

**Liquidação** é o processo automático de fechar posições de tomadores que não mantêm colateral suficiente para cobrir suas dívidas. Em protocolos DeFi, qualquer pessoa (liquidator) pode executar uma liquidação e receber um bônus como recompensa. Esse mecanismo mantém a solvência do protocolo.

## Como Funciona Tecnicamente

### Gatilho da Liquidação

Uma posição se torna liquidável quando o **health factor** cai abaixo de 1.

```
Health Factor = (Valor do Colateral × Threshold de Liquidação) / Valor da Dívida
```

- **Threshold de Liquidação**: porcentagem do colateral que o protocolo considera seguro (ex.: 85% do valor do colateral).
- Se o health factor ≤ 1, a posição está subcolateralizada e qualquer liquidator pode agir.

### Close Factor (Fator de Fechamento)

Define qual fração da dívida pode ser paga em uma única liquidação:

- **Close Factor Máximo**: geralmente 50% da dívida total (em protocolos como Aave/Compound).
- O liquidator paga até 50% da dívida e recebe o colateral equivalente com bônus.

### Liquidation Bonus (Bônus de Liquidação)

O liquidator recebe o colateral com desconto para compensar o risco e o custo de gás:

```
Bonus = Valor Pago × (1 + LiquidationBonus)
```

Exemplo: liquidation bonus de 5%. Se o liquidator paga US$ 1.000 da dívida, ele recebe US$ 1.050 em colateral.

### Bad Debt (Dívida Podre)

Ocorre quando o valor do colateral liquidado **não cobre** totalmente a dívida. Isso acontece em:

- Quedas de preço extremamente rápidas (flash crash).
- Colateral pouco líquido (difícil de vender).
- Pools pequenos onde a liquidação causa mais slippage.

O bad debt é socializado entre os depositantes do protocolo (ou arcado pelo tesouro, em alguns casos).

## Exemplo

1. Bob deposita 2 ETH (US$ 4.000) e toma emprestado 3.000 USDC. Threshold = 85%.
2. `Health Factor = (4.000 × 0,85) / 3.000 = 1,13` — saudável.
3. ETH cai para US$ 1.700: `(3.400 × 0,85) / 3.000 = 0,96` — abaixo de 1, liquidável.
4. Alice (liquidator) vê a posição e executa a liquidação: paga 50% da dívida (1.500 USDC).
5. Alice recebe colateral no valor de `1.500 × (1 + 0,05) = 1.575` USDC em ETH.
6. A posição de Bob é reduzida: dívida restante = 1.500 USDC; colateral restante calculado após a remoção.

## Risco

- **Liquidação Indevida**: oracle desatualizado ou manipulado pode fazer posições saudáveis parecerem liquidáveis.
- **Corrida de Liquidações**: se muitos liquidators disputam a mesma posição, o gás pode disparar e o maior pagador vence.
- **Bad Debt Sistêmico**: em eventos extremos (ex.: Luna crash), liquidações em cascata geram bad debt massivo.
- **Falta de Liquidators**: se não há liquidators dispostos (gás alto, volatilidade), posições ruins ficam abertas e o protocolo acumula perdas.

## Mitigação

- **Ajustar Liquidation Bonus**: bônus alto atrai mais liquidators, mas aumenta perda para o tomador liquidado.
- **TWAP em Oracles**: usar preço médio (TWAP) evita liquidações causadas por picos temporários de preço.
- **Partial Liquidation**: liquidar apenas parte da dívida (close factor) permite que o tomador se recupere sem perder tudo.
- **Liquidation Engine**: alguns protocolos têm motores internos de liquidação para garantir que posições sejam fechadas mesmo sem liquidators externos.
- **Colateral Conservador**: aceitar apenas ativos com alta liquidez e baixa volatilidade como colateral reduz risco de bad debt.
