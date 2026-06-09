# Questionário Pré-Auditoria — CryptoSec Lab

Este questionário deve ser preenchido pelo cliente antes do início da auditoria. As respostas permitem à equipe de auditoria compreender o projeto, seu estágio de desenvolvimento, e planejar a profundidade e escopo da análise.

**Instruções:** Marque todas as opções aplicáveis e preencha os campos solicitados. Para respostas "Sim", forneça detalhes adicionais no campo de observações.

---

## Dados do Projeto

| Campo | Resposta |
|-------|----------|
| **Nome do Projeto** | |
| **Website** | |
| **GitHub / Repositório** | |
| **Documentação Técnica (Link)** | |
| **Whitepaper / Litepaper** | |
| **Data Prevista para Lançamento** | |
| **Rede(s) Alvo** | [ ] Ethereum Mainnet [ ] BNB Chain [ ] Polygon [ ] Arbitrum [ ] Optimism [ ] Base [ ] Solana [ ] Outra: |
| **Idioma dos Contratos** | [ ] Solidity [ ] Vyper [ ] Rust [ ] Move [ ] Cairo [ ] Outro: |
| **Versão do Compilador** | |
| **Framework de Desenvolvimento** | [ ] Hardhat [ ] Foundry [ ] Truffle [ ] Remix [ ] Ape [ ] Outro: |

---

## Escopo Técnico

### Contratos para Auditoria

- [ ] Enviaremos uma lista completa de contratos e suas versões
- [ ] Os contratos estão todos em um único repositório
- [ ] Os contratos estão em múltiplos repositórios
- [ ] Há dependências externas (OpenZeppelin, Uniswap V3, etc.)
- [ ] Há contratos não auditados de terceiros sendo integrados
- [ ] O código está congelado para auditoria (não sofrerá alterações durante o processo)

**Número estimado de contratos:** _________
**Linhas de código (SLOC) estimadas:** _________
**Commit hash fornecido:** _________

### Redes e Endereços

| Contrato | Rede | Endereço | Versão | Status |
|----------|------|----------|--------|--------|
| | | | | [ ] Testnet / [ ] Mainnet |
| | | | | [ ] Testnet / [ ] Mainnet |
| | | | | [ ] Testnet / [ ] Mainnet |

---

## Arquitetura e Controles de Acesso

### Upgradeabilidade

- [ ] O sistema utiliza proxy pattern (UUPS / Transparent / Beacon)
- [ ] O contrato é imutável (não-upgradeable)
- [ ] O contrato utiliza Diamond pattern (EIP-2535)
- [ ] Há um timelock para upgrades
- [ ] O timelock tem duração de: _________ horas/dias
- [ ] Upgrades são controlados por multisig
- [ ] Upgrades são controlados por DAO

### Admin Keys e Privilégios

- [ ] Existe um admin / owner com privilégios especiais
- [ ] As funções administrativas são protegidas por multisig
- [ ] Qual é a configuração do multisig? ____/____ (ex.: 3/5)
- [ ] Quem são os signatários? _________
- [ ] O admin pode:
  - [ ] Pausar contratos
  - [ ] Sacar fundos de qualquer usuário
  - [ ] Mintar tokens ilimitados
  - [ ] Alterar parâmetros de protocolo (taxas, limites)
  - [ ] Alterar endereço de oráculos
  - [ ] Substituir implementações (upgrade)
  - [ ] Outro: _________
- [ ] As funções de admin têm rate limiting?
- [ ] Há uma função de renunciar (renounceOwnership)?

### Mecanismos de Emergência

- [ ] O contrato possui função de pause/emergency stop
- [ ] Quem pode acionar o pause?
  - [ ] Admin
  - [ ] Multisig
  - [ ] Role específica (ex.: GUARDIAN_ROLE)
  - [ ] Qualquer usuário
- [ ] O unpause requer timelock?
- [ ] Há um fundo de seguro / rescue fund?
- [ ] O sistema tem um kill switch?

---

## Oráculos e Fontes de Preço

- [ ] O protocolo utiliza oráculos de preço
- [ ] **Qual(is) oráculo(s)?**
  - [ ] Chainlink Price Feeds
  - [ ] Uniswap TWAP
  - [ ] Pyth Network
  - [ ] Tellor
  - [ ] Oráculo customizado próprio
  - [ ] Outro: _________
- [ ] Quantos oráculos são consultados por preço? _________
- [ ] Há mecanismo de fallback se o oráculo falhar?
- [ ] O preço é calculado como mediana/média de múltiplas fontes?
- [ ] O oráculo é atualizado em cada transação ou em intervalos fixos?
- [ ] Há proteção contra manipulação (ex.: TWAP, circuit breaker)?
- [ ] Os preços são verificados contra um desvio máximo aceitável?

---

## Bridges e Cross-Chain

- [ ] O protocolo utiliza bridge para outra chain
- [ ] **Tipo de bridge:**
  - [ ] Canonical bridge da própria L2
  - [ ] Third-party bridge (LayerZero, Wormhole, Axelar, etc.)
  - [ ] Bridge customizada própria
- [ ] Os validadores/relayers da bridge são:
  - [ ] Conjunto permissionado (whitelisted)
  - [ ] Conjunto permissionless (anyone can validate)
- [ ] A bridge já passou por auditoria externa?
- [ ] Há limite de valor por transação na bridge?
- [ ] Há mecanismo de rate limiting global?
- [ ] O tempo de finalidade entre chains é respeitado?

---

## Tokens e Ativos

- [ ] O protocolo utiliza ou emite tokens
- [ ] **Padrões de Token:**
  - [ ] ERC-20
  - [ ] ERC-721 (NFT)
  - [ ] ERC-1155 (Multi-token)
  ️ [ ] ERC-4626 (Tokenized Vault)
  - [ ] ERC-2612 (Permit)
  - [ ] Outro: _________
- [ ] **O token tem alguma destas características?**
  - [ ] Fee on transfer (tax token)
  - [ ] Rebasing
  - [ ] Pausable
  - [ ] Burnable
  - [ ] Mintable (inflacionário)
  - [ ] Com blacklist
- [ ] **Stablecoins utilizadas:**
  - [ ] USDC
  - [ ] USDT
  - [ ] DAI
  - [ ] LUSD
  - [ ] FRAX
  - [ ] Outra: _________

---

## Funcionalidades DeFi (se aplicável)

### Empréstimos (Lending)

- [ ] O protocolo opera empréstimos colateralizados
- [ ] Colaterais aceitos: _________
- [ ] LTV (Loan-to-Value) máximo: _________
- [ ] Há liquidações automáticas?
- [ ] Como são calculados os juros? [ ] Linear [ ] Composto [ ] Modelo próprio
- [ ] Há health factor monitorado?
- [ ] O que acontece em caso de bad debt?

### DEX / Trading

- [ ] O protocolo opera uma exchange descentralizada
- [ ] **Modelo:**
  - [ ] AMM (Constant Product - x*y=k)
  - [ ] StableSwap (Curve-like)
  - [ ] Order book (on-chain ou off-chain)
  - [ ] Concentrated Liquidity
- [ ] Há proteção contra sandwich attack?
- [ ] Há slippage protection obrigatória?
- [ ] O swap tem fee: _________%
- [ ] Há flash loans integrados?

### Yield Farming

- [ ] O protocolo oferece yield farming / staking
- [ ] Recompensas são em token próprio?
- [ ] Há período de lock-up?
- [ ] Penalidade por saque antecipado?
- [ ] Taxa de emissão: _________ tokens/bloco
- [ ] Há mecanismo de vesting?

---

## Desenvolvimento e Testes

### Documentação

- [ ] Spec (especificação técnica) completa
- [ ] Diagramas de arquitetura
- [ ] Documentação de API (se aplicável)
- [ ] NatSpec em todos os contratos
- [ ] README com instruções de build/teste/deploy

### Testes

**Framework de testes:** [ ] Foundry [ ] Hardhat [ ] Truffle [ ] ApeWorx [ ] Outro: _________

- [ ] Testes unitários para todas as funções principais
- [ ] Testes de integração
- [ ] Testes de fork (mainnet forking)
- [ ] Testes de invariantes (Foundry invariant tests)
- [ ] Testes de fuzzing
- [ ] Cobertura de código reportada: _________%

### CI/CD

- [ ] Pipeline CI configurada (GitHub Actions / CircleCI / etc.)
- [ ] Testes rodam automaticamente em cada PR
- [ ] Slither integrado à pipeline
- [ ] Linter configurado (Solhint)
- [ ] Análise de dependências (Dependabot / Snyk)

### Scripts de Deploy

- [ ] Scripts de deploy automatizados
- [ ] Scripts de verificação (Etherscan verification)
- [ ] Procedimento de deploy documentado
- [ ] Testnet já implantada? [ ] Sim [ ] Não
- [ ] Endereços em testnet: _________

---

## Segurança e Incidentes

### Histórico de Segurança

- [ ] O projeto já passou por auditoria anterior
  - [ ] Nome do auditor: _________
  - [ ] Data: _________
  - [ ] Achados anteriores corrigidos: [ ] Sim [ ] Não [ ] Parcialmente
- [ ] O projeto já sofreu incidente de segurança?
  - [ ] Data: _________
  - [ ] Descrição: _________
  - [ ] Valor perdido: _________
- [ ] O projeto já foi alvo de whitehat hacking?

### Bug Bounty

- [ ] O projeto tem bug bounty program ativo
- [ ] Plataforma: [ ] Immunefi [ ] HackerOne [ ] Própria [ ] Nenhuma
- [ ] Faixa de recompensas: _________ a _________
- [ ] Escopo do bug bounty cobre os contratos em auditoria?

### Insurance

- [ ] O protocolo possui seguro (cobertura)
- [ ] Provedor de seguro: _________
- [ ] Valor coberto: _________
- [ ] A cobertura cobre bugs de contrato inteligente?
- [ ] Há fundo de compensação para usuários?

### Custódia de Fundos

- [ ] Fundos de usuários ficam:
  - [ ] Em contrato inteligente (non-custodial)
  - [ ] Em carteira controlada pelo projeto (custodial)
  - [ ] Híbrido: _________
- [ ] Carteiras quentes (hot wallets) são multisig?
- [ ] Carteiras frias (cold storage) seguem que política?
- [ ] Fundos do tesouro (treasury) são geridos por DAO?

---

## Informações Adicionais

### Equipe

- [ ] Número de desenvolvedores: _________
- [ ] Experiência da equipe em blockchain: [ ] <1 ano [ ] 1-3 anos [ ] 3-5 anos [ ] 5+ anos
- [ ] A equipe possui engenheiro de segurança dedicado?
- [ ] Há advisor de segurança externo?

### Regulatório

- [ ] O projeto tem parecer jurídico sobre token classification?
- [ ] O projeto opera em jurisdição com regulação clara de cripto?
- [ ] Há procedimentos KYC/AML?

### Cronograma da Auditoria

- [ ] Data desejada para início: _________
- [ ] Data desejada para entrega do relatório: _________
- [ ] Número estimado de retestes: _________

---

## Declaração

Declaro que as informações fornecidas neste questionário são verdadeiras e completas até a presente data. Comprometo-me a notificar a CryptoSec Lab sobre qualquer alteração relevante no código ou escopo durante o período de auditoria.

**Nome:** _________________________________
**Cargo:** _________________________________
**Empresa / Projeto:** _________________________________
**Data:** _________
**Assinatura:** _________________________________

---

_Uso Interno — CryptoSec Lab_

| Campo | Preenchimento |
|-------|---------------|
| **Responsável pelo Pré-Audit** | |
| **Data de Recebimento** | |
| **Complexidade Estimada** | [ ] Baixa [ ] Média [ ] Alta [ ] Muito Alta |
| **Engenheiro Líder Designado** | |
| **Observações** | |
