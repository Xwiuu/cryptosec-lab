# AMM (Automated Market Maker)

## Formula

A constante do produto: **x * y = k**

Onde:
- x = reserve do token A
- y = reserve do token B
- k = constante (apos fee, k aumenta)

## Swap

```
amountOut = outReserve - (inReserve * outReserve) / (inReserve + amountIn)
```

Com fee (0.3%):
```
amountInWithFee = amountIn * 997
amountOut = (amountInWithFee * outReserve) / (inReserve * 1000 + amountInWithFee)
```

## Add Liquidity

```
shares = min(
    (amount0 * totalLiquidity) / reserve0,
    (amount1 * totalLiquidity) / reserve1
)
```

## Remove Liquidity

```
amount0 = (shares * reserve0) / totalLiquidity
amount1 = (shares * reserve1) / totalLiquidity
```

## Price Calculation

```
price = reserve1 / reserve0  // Price of token0 in terms of token1
```

## Riscos de Seguranca

1. **Price Manipulation**: Pools com baixa liquidez sao faceis de manipular
2. **Slippage**: Grandes ordens causam alto price impact
3. **Impermanent Loss**: Perda quando precos divergem do momento do deposit
4. **Sandwich Attack**: MEV que explora slippage
5. **Liquidity Draining**: Ataques a pools com precos manipulados
