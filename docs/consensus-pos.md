# Proof of Stake (PoS)

## Conceito

Validadores sao selecionados para propor blocos baseado no stake (tokens apostados).

## Implementacao em core-chain

Caracteristicas:
- Validadores registram stake minimo
- Selecao ponderada por stake
- Slashing por comportamento malicioso
- Recompensas para validadores honestos

## Seguranca

### Riscos
- **Nothing at Stake**: Validadores podem votar em multiplas forks sem custo
- **Long Range Attack**: Atacante pode recriar chain desde o genesis
- **Stake Grinding**: Manipular selecao de validador

### Mitigacoes
- Slashing conditions
- Checkpoints
- Finality gadgets

## Diferencas PoW vs PoS

| Aspecto | PoW | PoS |
|---------|-----|-----|
| Energia | Alta | Baixa |
| Centralizacao | ASICs | Stake grande |
| Seguranca | Testada | Teorica |
| Finalidade | Probabilistica | Instantanea |
