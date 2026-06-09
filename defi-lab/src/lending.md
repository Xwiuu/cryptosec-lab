# Lending Protocol

## Conceitos

- **Collateral**: Ativo depositado como garantia
- **Borrow**: Emprestimo tomado contra o collateral
- **Health Factor**: `collateralValue / borrowValue * 100`
- **Liquidation**: Quando health factor cai abaixo do threshold

## Health Factor

```
healthFactor = (collateralValue * liquidationThreshold) / borrowValue
```

Se < 1.0, posicao pode ser liquidada.

## Colateralizacao

```
maxBorrow = collateralValue * collateralFactor / 100
```

Onde collateralFactor tipicamente 70-80%.

## Liquidacao

- Liquidator paga parte da divida
- Recebe collateral com bonus (tipicamente 5-10%)
- Incentiva manter o protocolo saudavel

## Riscos

1. **Oracle Manipulation**: Preco manipulado causa liquidacoes indevidas
2. **Flash Loan Attacks**: Manipula preco, toma emprestimo sem colateral
3. **Bad Debt**: Colateral insuficiente apos liquidacao
4. **Liquidation Cascade**: Multiplas liquidacoes em cadeia
