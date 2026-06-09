# Lending Protocol

## O Que É

Um **Lending Protocol** (protocolo de empréstimos) é um sistema descentralizado que permite que usuários emprestem e tomem emprestado criptoativos sem intermediários. Os empréstimos são garantidos por **colateral** em excesso (overcollateralization), protegendo o protocolo contra inadimplência.

## Como Funciona Tecnicamente

### Pool de Empréstimos

Diferente de empréstimos peer-to-peer tradicionais, os lending protocols usam **pools de liquidez**:

- **Depositantes** fornecem liquidez a um pool e ganham juros.
- **Tomadores** pegam emprestado desse pool, pagando juros.
- As taxas de juros são determinadas algoritmicamente com base na **utilização** do pool.

```
Utilização = Total Emprestado / Total Disponível
```

### LTV — Loan-to-Value

O **LTV** define o máximo que um tomador pode pegar emprestado em relação ao colateral depositado:

```
LTV (%) = (Valor Emprestado / Valor do Colateral) × 100
```

Exemplo: colateral de 10 ETH (US$ 20.000) com LTV de 80% permite tomar até US$ 16.000.

### Health Factor

O **Health Factor** mede a saúde da posição do tomador:

```
Health Factor = (Colateral × Preço × Threshold de Liquidação) / Total Emprestado
```

- Se > 1: posição saudável.
- Se ≤ 1: posição pode ser liquidada.

### Liquidação

Quando o health factor cai abaixo de 1 (devido à queda do preço do colateral), qualquer pessoa pode executar uma **liquidação**: pagar parte da dívida do tomador em troca do colateral com um desconto (liquidation bonus).

### Juros

A taxa de juros é dinâmica, geralmente calculada com um modelo de duas curvas:

- **Utilização baixa**: juros baixos para incentivar empréstimos.
- **Utilização alta**: juros sobem exponencialmente para desincentivar novos empréstimos e atrair mais depositantes.

## Exemplo

1. Alice deposita **5 ETH** (US$ 10.000) no pool de empréstimos.
2. Ela toma emprestado **2.000 USDC** contra esse colateral (LTV de 20% — bem abaixo do máximo).
3. O health factor dela é `(5 × 2.000 × 0,85) / 2.000 = 4,25` (saudável).
4. Se o ETH cai para US$ 1.200: `(5 × 1.200 × 0,85) / 2.000 = 2,55` — ainda saudável.
5. Se o ETH cai para US$ 400: `(5 × 400 × 0,85) / 2.000 = 0,85` — abaixo de 1, posição liquidável.

## Risco

- **Liquidação Abrupta**: quedas rápidas de preço podem liquidar posições antes que o tomador consiga adicionar mais colateral.
- **Bad Debt**: quando o colateral liquidado não cobre totalmente a dívida — o protocolo fica com prejuízo (arcado pelos depositantes).
- **Risco de Oracle**: se o feed de preços for manipulado, posições podem ser liquidadas injustamente ou emprestar demais com colateral inflado.
- **Risco de Smart Contract**: bugs no contrato de empréstimo podem levar à perda de fundos.

## Mitigação

- **Manter Health Factor Elevado**: não pegar emprestado perto do LTV máximo (ex.: usar no máximo 50–60% do limite).
- **Monitorar Posições**: usar ferramentas como DeBank, Zapper ou o próprio dashboard do protocolo para acompanhar health factor.
- **Alertas de Preço**: configurar alertas para níveis de preço que tornariam a posição arriscada.
- **Adicionar Colateral**: depositar mais colateral antes de uma queda esperada de preço.
- **Diversificar Colateral**: usar múltiplos ativos como colateral reduz o risco de um único ativo cair drasticamente.
