# Flash Loan Attack

## Contexto
Flash loan permite emprestar sem colateral desde que o emprestimo seja devolvido na mesma transacao.

## Ataque a Governance

1. Tomar flash loan de tokens de governance
2. Criar proposta maliciosa
3. Votar com tokens emprestados
4. Aprovar proposta (quorum baixo)
5. Executar proposta (sem timelock)
6. Devolver flash loan

## Ataque a Oracle

1. Tomar flash loan de token A
2. Swap grande para manipular preco
3. Usar preco manipulado para liquidar posicoes ou drenar protocolo
4. Reverter swap
5. Devolver flash loan

## Mitigacao
- Snapshot voting (nao pode votar com tokens temporarios)
- Timelock em propostas
- TWAP para precos
- Limites de variacao em oraculos
