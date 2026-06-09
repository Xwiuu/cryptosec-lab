# Simulação de Bridge Replay Attack

## Contexto

Esta simulação demonstra um ataque de replay em uma ponte entre duas blockchains (Ethereum ↔ Arbitrum). O contrato `VulnerableBridge.sol` na chain de destino não mantém um registro de mensagens processadas, permitindo que uma mensagem legítima de depósito seja reenviada para cunhar tokens _wrapped_ sem lastro.

## Pré-condições

- Ponte entre Ethereum (origem) e Arbitrum (destino).
- `VulnerableBridge` na Arbitrum sem `processedMessages` mapping.
- Mensagens bridge públicas na blockchain (logs/eventos).
- Atacante capaz de observar e reenviar transações.

## Passo a Passo

1. Um usuário legítimo deposita 100 ETH na ponte na Ethereum. A bridge emite um evento `BridgeDeposit(destinatário: Bob, valor: 100, token: ETH)`.
2. O validador da ponte processa o evento na Arbitrum. `VulnerableBridge.cunha(bob, 100 WETH)`.
3. O atacante observa o evento `BridgeDeposit` nos logs da Ethereum.
4. O atacante chama `VulnerableBridge.processMessage(destinatário: Bob, valor: 100, token: ETH)` diretamente na Arbitrum com os mesmos parâmetros.
5. Como `VulnerableBridge` não verifica se a mensagem já foi processada, ela cunha novamente 100 WETH para Bob (ou Alice, se o atacante alterar o destinatário).
6. Se o atacante pode alterar o destinatário na chamada, ele cunha para si mesmo.
7. O atacante troca os 100 WETH cunhados por ETH real em uma DEX.

## Impacto

100 ETH _wrapped_ são cunhados sem lastro real. A oferta total de WETH na Arbitrum inflaciona. Quando o excesso é descoberto, a confiança na ponte colapsa e o valor do WETH pode desvalorizar. O atacante lucra ~$200.000 (100 ETH) às custas dos provedores de liquidez da ponte.

## Mitigação

A simulação com `SecureBridge.sol` inclui:
- `mapping(bytes32 => bool) public processedMessages`: registra o hash de cada mensagem processada.
- `nonce` incremental incluído em cada mensagem.
- `chainId` na mensagem para evitar replay entre chains.
- Verificação: `require(!processedMessages[msgHash], "Mensagem já processada")`.

Com essas proteções, a segunda chamada de `processMessage` reverte com "Mensagem já processada".
