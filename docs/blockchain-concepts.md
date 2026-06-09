# Blockchain Concepts

## O que e uma Blockchain

Blockchain e um ledger distribuido onde dados sao armazenados em blocos encadeados criptograficamente. Cada bloco contem um hash do bloco anterior, formando uma cadeia imutavel.

## Componentes Principais

### Bloco
Estrutura que armazena transacoes. Contem:
- Index (posicao na cadeia)
- Timestamp (quando foi criado)
- Transacoes (dados)
- Previous Hash (hash do bloco anterior)
- Hash (hash deste bloco)
- Nonce (usado no PoW)
- Difficulty (nivel de Proof of Work)
- Miner (quem minerou)

### Chain
Sequencia de blocos validados. O genesis block (index 0) e o primeiro.

### Consenso
Mecanismo que garante que todos os nos concordam com o estado.

### PoW (Proof of Work)
Miners competem para encontrar um nonce que faca o hash comecar com N zeros.

### PoS (Proof of Stake)
Validadores sao selecionados proporcionalmente ao stake que possuem.

## Seguranca

- **Imutabilidade**: Blocos nao podem ser alterados sem invalidar toda a cadeia
- **Consenso**: Maioria da rede deve concordar
- **Criptografia**: Hash e assinatura protegem integridade e autenticidade
