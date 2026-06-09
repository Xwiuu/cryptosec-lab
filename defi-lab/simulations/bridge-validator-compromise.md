# Simulação de Bridge Validator Compromise

## Contexto

Esta simulação demonstra o impacto do comprometimento de um validador único em uma ponte entre chains. O contrato `VulnerableBridge.sol` aceita mensagens assinadas por um único validador predefinido. Se esse validador é comprometido, o atacante pode cunhar tokens ilimitados.

## Pré-condições

- `VulnerableBridge` com `address public validator` — uma única entidade autoriza mint.
- Validador comprometido — chave privada exposta ou servidor invadido.
- Sem limite de mint, sem threshold, sem monitoramento.

## Passo a Passo

1. O atacante obtém a chave privada do validador (por exemplo, através de engenharia social ou vulnerabilidade no servidor de assinatura).
2. O atacante forja uma mensagem de mint:
   - `destinatário`: endereço do atacante na chain de destino.
   - `valor`: 1.000.000 (1 milhão de tokens).
   - `token`: endereço do token WETH na chain de destino.
   - Assina a mensagem com a chave comprometida.
3. O atacante chama `VulnerableBridge.executeMint(destinatário, valor, token, assinatura)`.
4. O contrato verifica a assinatura: `require(ECDSA.recover(hash, assinatura) == validator)` — verdadeiro.
5. O contrato cunha 1.000.000 WETH para o atacante.
6. O atacante troca 500.000 WETH por ETH real em várias DEXs.
7. O restante dos tokens é vendido em múltiplas transações para evitar slippage excessivo.

## Impacto

A oferta de WETH na chain de destino aumenta em 1.000.000 (sem lastro). Os provedores de liquidez que aceitam WETH em pools são drenados. O ETH real trocado pelo atacante sai das pools, causando perda para os LPs. O atacante lucra ~$1 bilhão (a $2.000/ETH). A ponte perde toda a credibilidade e é abandonada.

## Mitigação

A simulação com `SecureBridge.sol` (multisig com threshold 3 de 5 validadores) impede o ataque: mesmo com uma chave comprometida, o atacante precisaria de 3 chaves distintas para forjar uma mensagem válida. Além disso, o contrato inclui:
- `rateLimit`: no máximo 10.000 tokens por hora.
- `mapping(address => uint) lastMintTimestamp`: impede mint para o mesmo endereço em intervalo curto.
- Monitoramento off-chain com alertas para mint acima de $100.000.

Com 5 validadores independentes (entidades geograficamente distribuídas), a probabilidade de comprometer 3 simultaneamente é significativamente reduzida.
