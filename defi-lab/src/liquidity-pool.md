# Liquidity Pool

## Funcionamento

- LPs depositam pares de tokens em proporcao
- Recebem LP tokens representando sua share
- Ganham fees de trading proporcionalmente
- Podem remover liquidez a qualquer momento

## LP Token Pricing

```
share = userLiquidity / totalLiquidity
amount0 = share * reserve0
amount1 = share * reserve1
```

## Riscos

1. **Impermanent Loss**: Perda vs segurar os tokens
2. **Rug Pull**: Criador do pool retira liquidez subitamente
3. **Manipulacao**: Pools finas sao faceis de manipular
4. **Fee Structure**: Fees muito baixos nao compensam risco
