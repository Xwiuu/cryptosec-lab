# Simulação de Lending Pool Drain

## Contexto

Esta simulação foca exclusivamente no protocolo de lending, demonstrando como um atacante pode depositar pouco colateral e, através da manipulação de oráculo, emprestar muito mais do que o permitido, gerando _bad debt_ para o protocolo.

## Pré-condições

- Pool de lending com $500.000 em ativos disponíveis para empréstimo.
- Oráculo baseado em preço spot de AMM com reservas rasas (10 ETH / 20.000 USDC).
- Flash loan não é estritamente necessário — o atacante pode ter capital próprio, mas a simulação usa flash loan para demonstrar o ataque sem capital inicial.

## Passo a Passo

1. O atacante toma 200 ETH emprestados via flash loan.
2. Com 200 ETH, manipula a AMM: troca 200 ETH por USDC, esvaziando a reserva de ETH. A pool vai de (10 ETH, 20.000 USDC) para (210 ETH, ~1.905 USDC). Preço do ETH cai de 2.000 para ~9 USDC na pool.
3. O atacante deposita os USDC obtidos (~18.095) como colateral. O oráculo agora reporta um preço distorcido para ETH (extremamente baixo).
4. Na verdade, o atacante pode escolher qual ativo depositar. Estratégia comum: depositar um ativo que foi artificialmente inflado (não desinflado). Então, em vez de derrubar o ETH, o atacante pode comprar todo o ETH da pool, inflando o preço do USDC.
5. Com o colateral inflado, o atacante empresta o máximo de ETH disponível no pool de lending (por exemplo, 200 ETH).
6. Devolve o flash loan de 200 ETH com o ETH emprestado.
7. O lucro do atacante é o colateral depositado (USDC) menos taxas.

## Impacto

O protocolo de lending fica com aproximadamente $18.000 em colateral (USDC) para cobrir um empréstimo de 200 ETH (~$400.000). _Bad debt_ de ~$382.000. Depositantes do pool de lending perdem seus fundos.

## Mitigação

A simulação demonstra que com LTV máximo de 50% em vez de 75%, o atacante consegue emprestar menos, mas ainda há dano. A mitigação mais eficaz é o uso de Chainlink como fonte de preço (preço externo, não manipulável via swap) em vez de oráculo spot interno.
