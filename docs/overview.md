# CryptoSec Lab - Overview

## O que e

CryptoSec Lab e um laboratorio educacional de blockchain security que cobre:

- Implementacao de blockchain em Rust (PoW + PoS)
- Criptografia aplicada (hash, assinatura, wallet)
- Vulnerabilidades blockchain (double spend, replay, 51%)
- Smart contracts Solidity vulneraveis e seguros
- Foundry tests de ataques
- Documentacao DeFi (AMM, lending, oracles)
- Templates e checklists de auditoria profissional

## Publico-Alvo

- Estudantes de ciberseguranca
- Auditores Web3
- Desenvolvedores blockchain
- Profissionais de seguranca ofensiva/defensiva
- Empresas que querem entender riscos cripto

## Stack

| Componente | Tecnologia |
|------------|-----------|
| Blockchain core | Rust, Tokio, Axum, Serde |
| Hash | SHA-256, Blake3 |
| Assinatura | Ed25519 |
| Smart contracts | Solidity ^0.8, Foundry |
| API | Axum REST |
| Testes | Cargo test, Forge test |

## Modulos

1. **core-chain**: Blockchain completa com PoW, PoS, wallet, mempool, API
2. **vulnerable-chain**: 10 vulnerabilidades blockchain demonstradas
3. **contracts**: 7 pares vulneravel/seguro + 9 testes Foundry
4. **defi-lab**: Documentacao DeFi e 5 simulacoes de ataques
5. **exploits**: Documentacao detalhada de ataques
6. **audits**: Templates e checklists profissionais
7. **docs**: Glossario, conceitos, threat model
