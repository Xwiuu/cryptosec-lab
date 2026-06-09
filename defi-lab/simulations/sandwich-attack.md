# Simulação de Sandwich Attack

## Contexto

Esta simulação recria um ataque de sandwich em uma pool Uniswap V2 com liquidez moderada (100 ETH / 200.000 USDC). Um bot MEV monitora a mempool, identifica uma transação de swap grande e executa o ataque front-run + back-run para extrair valor da vítima.

## Pré-condições

- A pool pública na rede Ethereum (ou rede de teste compatível com MEV).
- Vítima envia uma transação de swap de 10 ETH para USDC sem `amountOutMin` adequado.
- Atacante opera um bot capaz de pagar gas price mais alto para ser incluído no mesmo bloco.
- `eth_call` disponível para simular a operação antes da execução real.

## Passo a Passo

1. O atacante detecta a transação da vítima na mempool: swap de 10 ETH → USDC, com `amountOutMin` = 0 (ou muito baixo).
2. O atacante calcula o impacto de preço: com 10 ETH, o preço do ETH sobe de 2.000 para ~2.020 USDC.
3. O atacante envia uma transação **front-run**: compra 5 ETH com USDC, elevando o preço de 2.000 para ~2.010 USDC.
4. A transação da vítima é executada: compra os 10 ETH ao preço médio de ~2.015 USDC — a vítima recebe ~19.850 USDC em vez dos ~20.000 esperados.
5. O atacante envia uma transação **back-run**: vende os 5 ETH comprados, agora a ~2.020 USDC (preço elevado pela vítima).
6. O atacante realiza lucro de ~50 USDC (5 ETH * (2.020 - 2.010) = 50 USDC), menos taxas.

## Impacto

A vítima perde ~150 USDC na operação (0,75% de slippage). O atacante lucra ~50 USDC. Em uma pool com liquidez menor, o impacto seria mais severo. Com múltiplos bots competindo, o lucro do atacante é reduzido, mas a vítima sempre perde.

## Mitigação

A simulação demonstra que com `amountOutMin` definido para 19.900 USDC, a transação da vítima reverte se o slippage exceder 0,5%. Além disso, usar Flashbots RPC ou um _relay privado_ (como o `eth_sendPrivateTransaction`) impede que a transação seja vista na mempool pública, tornando o ataque de sandwich inviável.
