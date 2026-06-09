# CryptoSec Lab — Framework de Auditoria

Diretório oficial do framework de auditoria do CryptoSec Lab. Contém templates profissionais, checklists de segurança por categoria, relatórios de exemplo, e a metodologia completa de auditoria.

---

## Estrutura do Diretório

```
audits/
├── README.md                     # Este arquivo — visão geral do framework
├── methodology.md                # Metodologia completa de auditoria (11 etapas + tipos)
├── risk-matrix.md                # Matriz de risco: severidade, impacto, probabilidade
│
├── templates/                    # Templates reutilizáveis para engajamentos
│   ├── audit-report-template.md  # Template de relatório de auditoria completo
│   ├── scope-definition-template.md   # Template de definição de escopo
│   ├── client-questionnaire.md   # Questionário pré-auditoria para clientes
│   ├── executive-summary-template.md  # Template de sumário executivo
│   ├── finding-template.md       # Template individual de finding
│   └── retest-template.md        # Template de relatório de reteste
│
├── checklists/                   # Checklists de segurança por categoria
│   ├── blockchain-protocol-checklist.md   # Protocolos blockchain (L1/L2)
│   ├── smart-contract-checklist.md        # Contratos inteligentes
│   ├── defi-checklist.md                  # DeFi (lending, farming, etc.)
│   ├── dex-checklist.md                   # DEX (AMM, order book)
│   ├── bridge-checklist.md                # Cross-chain bridges
│   ├── wallet-security-checklist.md       # Carteiras (software + hardware)
│   ├── exchange-security-checklist.md     # Exchanges (CEX + DEX)
│   ├── dao-checklist.md                   # DAO governance
│   └── nft-checklist.md                   # NFTs e marketplaces
│
├── operational-security-checklist.md     # Segurança operacional e processos
│
└── sample-reports/               # Relatórios de exemplo para referência
    ├── sample-smart-contract-audit.md     # Auditoria de contrato simples
    ├── sample-dex-audit.md                # Auditoria de DEX
    ├── sample-defi-audit.md               # Auditoria DeFi completa
    ├── sample-bridge-audit.md             # Auditoria de bridge cross-chain
    ├── sample-protocol-audit.md           # Auditoria de protocolo blockchain
    └── sample-wallet-audit.md             # Auditoria de wallet (software/hardware)
```

---

## Como Usar o Framework

### Fluxo de Trabalho Recomendado

```
1. QUESTIONÁRIO
   └── Enviar client-questionnaire.md ao cliente
   └── Definir escopo com scope-definition-template.md

2. PLANEJAMENTO
   └── Escolher checklists aplicáveis (checklists/*)
   └── Revisar metodologia (methodology.md)
   └── Consultar matriz de risco (risk-matrix.md)

3. EXECUÇÃO DA AUDITORIA
   └── Seguir a metodologia (methodology.md) — 11 etapas
   └── Usar checklists para guiar revisão
   └── Documentar cada finding com finding-template.md

4. RELATÓRIO
   └── Usar audit-report-template.md
   └── Incluir sumário executivo (executive-summary-template.md)
   └── Classificar severidade conforme risk-matrix.md

5. RETESTE
   └── Após correções do cliente
   └── Usar retest-template.md
   └── Atualizar relatório principal

6. ENTREGA
   └── Relatório final em PDF + Markdown
   └── Planilha de achados
   └── Certificado de auditoria (opcional)
```

---

## Metodologia (methodology.md)

O documento de metodologia descreve em detalhes as 11 etapas do processo de auditoria:

| # | Etapa | Descrição |
|---|-------|-----------|
| 1 | **Definição de Escopo** | Delimitação do que será auditado, commits, redes, SLOC |
| 2 | **Revisão de Arquitetura** | Análise de design, trust model, superfície de ataque |
| 3 | **Modelagem de Ameaças** | STRIDE, attack trees, adversary models |
| 4 | **Revisão Manual de Código** | Inspeção linha a linha com checklist |
| 5 | **Varredura Automatizada** | Slither, Mythril, Aderyn, solhint |
| 6 | **Testes Unitários/Invariantes** | Foundry fuzzing, invariant tests, coverage |
| 7 | **Simulação de Ataques Econômicos** | Flash loans, oracle manipulation, MEV |
| 8 | **Classificação de Achados** | Severidade = Impacto × Probabilidade |
| 9 | **Orientação de Remediação** | Recomendações específicas e acionáveis |
| 10 | **Reteste** | Verificação de correções |
| 11 | **Relatório Final** | Entrega profissional com todos os artefatos |

Inclui também a descrição dos 7 tipos de auditoria: Protocol, Smart Contract, DeFi, Wallet, Exchange, Bridge e OpSec.

---

## Matriz de Risco (risk-matrix.md)

A severidade de cada finding é determinada pela Matriz de Risco:

| Impacto \ Probabilidade | Trivial | Fácil | Moderado | Difícil | Teórico |
|:-----------------------:|:-------:|:-----:|:--------:|:-------:|:-------:|
| **Perda Total de Fundos** | Critical | Critical | Critical | High | High |
| **Perda Significativa** | Critical | High | High | Medium | Medium |
| **Bloqueio Temporário** | High | High | Medium | Low | Low |
| **Tomada de Governança** | Critical | High | High | Medium | Medium |
| **Exposição de Dados** | High | Medium | Medium | Low | Info |
| **Dano Reputacional** | Medium | Medium | Low | Low | Info |
| **Insolvência do Protocolo** | Critical | Critical | High | High | Medium |

### Tabela de Severidades

| Severidade | Descrição | SLA | Ação |
|------------|-----------|-----|------|
| **Critical** | Perda financeira imediata e certa | Imediato | Não deployar sem correção |
| **High** | Perda significativa provável | 7 dias | Corrigir antes do deploy |
| **Medium** | Risco condicional moderado | 30 dias | Corrigir no próximo upgrade |
| **Low** | Baixo impacto, boas práticas | Próximo deploy | Corrigir quando conveniente |
| **Info** | Recomendação, sem impacto direto | N/A | Melhoria contínua |

---

## Templates

| Template | Descrição | Quando Usar |
|----------|-----------|-------------|
| `audit-report-template.md` | Relatório completo de auditoria com capa, exec summary, findings, apêndices | Para todo relatório final |
| `scope-definition-template.md` | Definição formal de escopo com in/out, roles, assumptions, deliverables | Antes de iniciar o engajamento |
| `client-questionnaire.md` | Questionário detalhado para cliente sobre arquitetura, segurança, deploy | Pré-auditoria |
| `executive-summary-template.md` | Sumário executivo com overview, key findings, risk assessment | Seção do relatório ou standalone |
| `finding-template.md` | Template individual de cada vulnerabilidade com PoC, root cause, fix | Documentar cada achado |
| `retest-template.md` | Relatório de verificação pós-correção | Reteste de findings |

---

## Checklists

| Checklist | Cobertura |
|-----------|-----------|
| `blockchain-protocol-checklist.md` | Segurança de protocolos L1/L2: consenso, P2P, finalidade, slashing |
| `operational-security-checklist.md` | Segurança operacional: keys, CI/CD, incident response, deploy |
| `smart-contract-checklist.md` | Vulnerabilidades EVM: reentrância, overflow, acesso, lógica |
| `defi-checklist.md` | DeFi: lending, borrowing, liquidations, yield, flash loans |
| `dex-checklist.md` | DEX: AMM math, slippage, liquidity, sandwich, TWAP |
| `bridge-checklist.md` | Bridges: validadores, provas, lock/mint, finalidade |
| `wallet-security-checklist.md` | Wallets: key derivation, storage, signing, firmware |
| `exchange-security-checklist.md` | Exchanges: hot/cold wallets, trading engine, APIs, KYC |
| `dao-checklist.md` | Governance: proposals, voting, timelocks, treasury |
| `nft-checklist.md` | NFTs e marketplaces: minting, royalties, metadados |

---

## Sample Reports

| Relatório | Descrição |
|-----------|-----------|
| `sample-smart-contract-audit.md` | Auditoria de exemplo mostrando reentrância crítica em contrato bancário |
| `sample-dex-audit.md` | Auditoria de exemplo mostrando slippage, liquidez e manipulação em DEX |
| `sample-defi-audit.md` | Auditoria DeFi completa com oracle, lending, stablecoin |
| `sample-bridge-audit.md` | Auditoria de bridge cross-chain com replay protection |
| `sample-protocol-audit.md` | Auditoria de protocolo blockchain (Rust) |
| `sample-wallet-audit.md` | Auditoria de wallet com geração de chaves |

---

## Ferramentas Recomendadas

| Ferramenta | Uso | Documentação |
|------------|-----|-------------|
| **Slither** | Análise estática de Solidity | `slither .` |
| **Mythril** | Execução simbólica | `mythril analyze` |
| **Foundry** | Testes, fuzzing, invariantes | `forge test`, `forge coverage` |
| **Echidna** | Fuzzing baseado em propriedades | `echidna-test` |
| **Aderyn** | Detecção de padrões inseguros | `aderyn .` |
| **Solhint** | Linter para Solidity | `solhint contracts/**/*.sol` |

---

## Integração Comercial (Portfolio)

Este diretório de framework técnico fornece os recursos e checklists de auditoria que fundamentam os serviços comerciais e propostas contidos no [Pacote Comercial do Portfólio (portfolio/)](file:///D:/Prg/CryptoSec-Lab/portfolio/README.md).

---

## Licenciamento

Este framework é propriedade intelectual da CryptoSec Lab. Seu uso é permitido para projetos auditados pela CryptoSec Lab. Distribuição ou modificação não autorizada é proibida.

**CryptoSec Lab** — Auditoria de Segurança Blockchain & DeFi

