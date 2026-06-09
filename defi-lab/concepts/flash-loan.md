# Flash Loan

## O Que É

Um **Flash Loan** é um empréstimo que deve ser tomado e devolvido **dentro da mesma transação**. Não exige colateral — o requisito é que o valor emprestado + taxa seja pago antes da transação terminar. Se não for pago, a transação inteira é revertida (como se nunca tivesse acontecido).

## Como Funciona Tecnicamente

### Mecanismo

1. Um usuário chama um smart contract que oferece flash loans (ex.: Aave, dYdX, Maker).
2. O contrato empresta os ativos ao contrato do usuário.
3. O contrato do usuário executa qualquer lógica (arbitragem, troca, liquidação).
4. Se, ao final da execução, o saldo + taxa não for devolvido, a transação inteira reverte (via `require` ou `revert`).

```
1. Borrow:    contrato_empresta_ativo(X)
2. Execute:   realizar_operacoes()    // usa X
3. Repay:     devolver_X + taxa()
// Se falhar → transação inteira é desfeita
```

### Por que funciona?

No Ethereum e EVM compatíveis, o estado da blockchain só é atualizado **após** a execução completa da transação. Se o `revert` é chamado, tudo volta ao estado anterior. Flash loans exploram essa atomicidade.

### Usos Legítimos

- **Arbitragem entre DEXs**: comprar barato em uma DEX, vender caro em outra, lucrar a diferença — tudo em uma tx.
- **Liquidação de Posições**: liquidar posições subcolateralizadas em lending protocols sem ter capital próprio.
- **Refinanciamento**: trocar dívida de um protocolo para outro com juros melhores.
- **Swap de Colateral**: trocar o ativo de colateral sem precisar fechar a posição.

### Usos Ofensivos

- **Manipulação de Oracle**: tomar flash loan, comprar grande quantidade em pool pequeno, distorcer preço, explorar protocolo que usa preço spot, e devolver o empréstimo.
- **Governance Attack**: acumular votos temporariamente para aprovar propostas maliciosas.
- **Ataque a Lending Protocols**: inflar colateral com flash loan, pegar emprestado drenando o pool.

## Exemplo

1. Flash loan de 1.000 ETH do pool da Aave.
2. Na mesma tx: comprar ETH por 1.900 USDC no Uniswap e vender por 1.950 USDC no Sushiswap.
3. Lucro = 50 USDC (menos taxas/gas).
4. Devolver 1.000 ETH + taxa para Aave. A transação é bem-sucedida.

Se, por qualquer motivo, o lucro não cobrir a taxa, a tx reverte e o flash loan nunca aconteceu.

## Risco

- **Para Protocolos**: flash loans amplificam ataques financeiros. Atacantes podem manipular pools com capital temporário massivo.
- **Risco de Reentrância**: implementações inseguras podem permitir que atacantes executem lógica múltiplas vezes antes de devolver o empréstimo.
- **Cadeia de Reversões**: se uma das operações intermediárias falha, toda a tx é revertida — mas o gás já foi pago.

## Mitigação

- **TWAP em Oracles**: usar preços médios em vez de spot price impede manipulação instantânea com flash loans.
- **Verificações de Estado**: protocolos devem checar se o saldo final da tx é ≥ saldo inicial, não apenas se o pagamento foi recebido.
- **Limites por Bloco**: restringir quantidade negociável por bloco reduz impacto de flash loans.
- **Reentrancy Guards**: usar mutex (ex.: OpenZeppelin `ReentrancyGuard`) para evitar chamadas recursivas.
- **Simulação Off-Chain**: ferramentas de simulação podem detectar se uma transação envolve flash loan e analisar riscos.
