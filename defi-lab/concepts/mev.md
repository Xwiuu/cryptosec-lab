# MEV — Miner Extractable Value / Maximal Extractable Value

## O Que É

**MEV (Maximal Extractable Value)** é o lucro máximo que um minerador (validador) ou bot pode extrair ao reordenar, incluir ou excluir transações dentro de um bloco. Originalmente chamado de "Miner Extractable Value", hoje o termo é "Maximal Extractable Value" porque validadores em Proof-of-Stake também extraem esse valor. MEV representa tanto oportunidades de arbitragem legítimas quanto ataques prejudiciais aos usuários.

## Como Funciona Tecnicamente

### Por que o MEV existe?

Em blockchains como Ethereum, as transações são públicas no mempool (fila de transações pendentes) antes de serem mineradas. Qualquer pessoa pode ver as transações e tentar se antecipar a elas — desde que pague mais gás para ser priorizada.

### Estratégias Comuns

#### 1. Front-running

O bot detecta uma transação lucrativa no mempool e insere a **sua** transação antes da vítima.

- Exemplo: a vítima está prestes a comprar um token grande em uma DEX. O bot compra primeiro (aumentando o preço) e vende para a vítima por um preço mais alto.

```
Bloco: [Bot_compra] → [Vítima_compra] → [Bot_vende]
```

#### 2. Back-running

O bot coloca sua transação **imediatamente após** uma transação alvo, aproveitando a mudança de estado.

- Exemplo: uma grande liquidação em um lending protocol abaixa o preço de um ativo — o bot compra logo depois.

```
Bloco: [Liquidação] → [Bot_compra]
```

#### 3. Sandwich Attack

Combinação de front-running + back-running em uma transação DEX.

```
Bloco: [Bot_compra] → [Vítima_compra] → [Bot_vende]
```

- A vítima compra a um preço inflado (front-running) e o bot vende com lucro (back-running).
- A vítima sofre slippage severo e o bot lucra às suas custas.

### Private Mempool (Mempool Privado)

Para se proteger de front-running, serviços como **Flashbots**, **BloxRoute** e **Eden** permitem que usuários enviem transações diretamente para mineradores/validadores **sem expor ao mempool público**. A transação é incluída em um bundle privado.

### Order Flow

O **Order Flow** (fluxo de ordens) é o conjunto de transações que um usuário ou aplicação envia para a blockchain. Controlar o order flow é extremamente valioso — projetos como Flashbots permitem que aplicações leiloem seu order flow para builders/validadores, gerando receita (builder revenue).

## Exemplo

1. Alice quer comprar 10.000 USDC em ETH no Uniswap.
2. Ela envia a transação — ela aparece no mempool público.
3. Um bot MEV detecta a tx e executa um sandwich:
   - Compra ETH antes de Alice (preço sobe).
   - Alice compra ETH ao preço inflado.
   - Bot vende o ETH que comprou para Alice, lucrando a diferença.
4. Alice paga mais caro e o bot lucra com o deslize de preço.

## Risco

- **Perda Financeira para Usuários**: vítimas de front-running e sandwich attacks pagam mais caro em trades (slippage pior).
- **Congestão de Rede**: bots MEV pagam gás alto, elevando o preço do gás para todos.
- **Centralização**: apenas mineradores/validadores grandes e builders com acesso a order flow privilegiado dominam a extração de MEV.
- **Ataques Coordenados**: MEV pode ser combinado com flash loans para ataques maiores (ex.: manipulação de pools).

## Mitigação

- **Slippage Protection**: configurar tolerância máxima de slippage na interface (ex.: 0,5%) — se o preço mudar mais que isso, a transação falha.
- **Private Mempool (Flashbots)**: usar RPC privado (ex.: `flashbots.net`) ou habilitar "MEV Protection" em wallets como MetaMask, Rabby.
- **Limite de Gás**: bots MEV geralmente pagam gás mais alto; definir `maxFeePerGas` razoável reduz chances de ser atacado (mas não elimina).
- **DEXs com Proteção**: usar DEXs como CowSwap ou 1inch (modo RFQ) que executam ordens via leilão de liquidez, evitando mempool público.
- **Fair Sequencing**: soluções como Shutter Network ou Chainlink Fair Sequencing Services propõem criptografia de transações para eliminar front-running.
