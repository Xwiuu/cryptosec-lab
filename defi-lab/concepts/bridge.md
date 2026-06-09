# Bridge — Ponte Cross-Chain

## O Que É

Uma **Bridge (Ponte)** é um protocolo que permite transferir ativos ou dados entre blockchains diferentes (ex.: Ethereum → Polygon, Solana → BNB Chain). Sem pontes, cada blockchain opera isoladamente — pontes criam interoperabilidade.

## Como Funciona Tecnicamente

### Lock-Mint (Princípio Mais Comum)

1. **Lock**: o usuário deposita ativos na chain de origem (ex.: 10 ETH na Ethereum).
2. **Mint**: a bridge emite uma representação (wrapped token) na chain de destino (ex.: 10 ETH "bridgeado" viram 10 weETH na Polygon).
3. **Burn-Release**: para voltar, o wrapped token é queimado na chain de destino, e os ativos originais são liberados na chain de origem.

```
Origem:  Deposita ETH → Contrato Lock
Destino: Contrato Mint → Cunha weETH (representação)
Para voltar:
Destino: Queima weETH → Contrato Burn
Origem:  Contrato Release → Libera ETH
```

### Message Passing

Pontes mais sofisticadas transmitem **mensagens genéricas** (não apenas tokens). Um contrato na chain A chama um contrato na chain B via:

- **Light Client / Relayer**: validadores da chain A atestam a mensagem.
- **Validator Set**: um conjunto de nós autorizados valida e retransmite mensagens entre chains.

### Validadores e Relayers

- **Validadores**: entidades que observam eventos em uma chain e assinam provas criptográficas.
- **Relayers**: entidades que entregam essas provas para a outra chain.

Se o validador é corrupto, ele pode assinar mensagens falsas (ex.: liberar ETH sem o bloqueio correspondente).

## Exemplo

1. Alice quer mover 1.000 USDC da Ethereum para a Arbitrum.
2. Ela deposita 1.000 USDC no contrato da ponte na Ethereum.
3. Validadores da ponte detectam o depósito e aprovam a mintagem.
4. O Relayer entrega a prova na Arbitrum e 1.000 USDC (representação) são cunhados para Alice.
5. Alice pode gastar esses USDC na Arbitrum como se fossem nativos.

## Risco

### Ataques Conhecidos

- **Replay Attack**: uma transação válida em uma chain é reenviada em outra chain. Mitigado com nonces e chain IDs.
- **Validator Compromise**: atacantes controlam validadores e assinam liberações falsas — um dos maiores riscos de pontes.
- **Chain Fork**: após um fork, a mesma transação pode ser válida nas duas chains, permitindo gasto duplo.
- **Smart Contract Bug**: erros no contrato Lock ou Mint podem drenar fundos.

### Hacks Notórios

| Ataque | Valor | Ano | Causa |
|:---|---:|---:|:---|
| Ronin Bridge | ~US$ 625M | 2022 | 5/9 validadores comprometidos |
| Wormhole | ~US$ 325M | 2022 | Bug no contrato de mint |
| Nomad Bridge | ~US$ 190M | 2022 | Root access mal configurada |
| Poly Network | ~US$ 610M | 2021 | Bug em função de contrato |

## Mitigação

- **Multi-Sig e Governança**: pontes seguras exigem múltiplas assinaturas para liberar fundos, não apenas um validador.
- **Limites de Transferência**: restringir valor máximo por dia/bloco reduz perda máxima em caso de ataque.
- **Provas Criptográficas**: usar light clients (SPV proofs) em vez de trust em validadores — elimina necessidade de confiança.
- **Monitoramento em Tempo Real**: detectar atividade suspeita nos validadores e pausar a ponte.
- **Auditorias Múltiplas**: pontes devem ser auditadas por ao menos 2–3 empresas diferentes devido à criticidade dos fundos.
- **Preferir Pontes Canônicas**: usar pontes oficiais da própria chain (ex.: Arbitrum Bridge, Polygon PoS Bridge) em vez de terceiros não auditados.
