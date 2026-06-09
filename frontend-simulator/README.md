# CryptoSec Frontend Simulator

Interface visual premium para simular o ecossistema CryptoSec Lab — blockchain, wallets, transações, mineração, smart contracts, DeFi, DEX, DAO, NFT, bridge, scanner e auditoria.

> ⚠️ **Aviso Ético**: Este frontend é estritamente educacional. Não conecta mainnet, não usa carteiras reais, não envia transações reais, não usa chaves reais. Tudo é simulado com dados mockados.

## Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS v4** (dark-first design system)
- **Zustand** (estado global)
- **Framer Motion** (animações)
- **Recharts** (gráficos)
- **Lucide React** (ícones)

## Como Rodar

```bash
cd frontend-simulator
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Build

```bash
npm run lint
npm run typecheck
npm run build
```

Status atual:

- `npm run lint` passa via ESLint CLI (`eslint .`).
- `npm run typecheck` passa com `tsc --noEmit`.
- `npm run build` passa e exporta 23 páginas estáticas.
- `npm audit --omit=dev` passa com 0 vulnerabilidades.
- Monaco está integrado de forma leve em `/contracts`; mobile usa `CodeBlock` estático.
- React Flow ainda não está integrado; o node graph segue simples.

## Rotas

| Rota | Módulo |
|------|--------|
| `/` | Dashboard geral |
| `/chain` | Chain Explorer |
| `/wallet` | Wallet Simulator |
| `/mempool` | Mempool Monitor |
| `/mining` | Mining / Consensus |
| `/nodes` | Network Nodes |
| `/tokens` | Token / Altcoin Lab |
| `/contracts` | Smart Contract Lab |
| `/vulnerabilities` | Vulnerability Playground |
| `/defi` | DeFi Overview |
| `/dex` | DEX / AMM Simulator |
| `/lending` | Lending Pool Simulator |
| `/stablecoin` | Stablecoin Lab |
| `/dao` | DAO Governance |
| `/nft` | NFT Lab |
| `/bridge` | Bridge Security |
| `/scanner` | Scanner Dashboard |
| `/audit` | Audit Report Builder |
| `/reports` | Sample Reports |
| `/settings` | Lab Settings |

## Módulos

### Core Lab
- **Dashboard**: visão geral com métricas, findings recentes, timeline de ataques
- **Chain**: explorer de blocos com simulação de tampering e forks
- **Wallet**: criação de wallet demo, seed phrase, riscos de assinatura
- **Mempool**: transações pendentes, spam, replay, double spend, proteções
- **Mining**: PoW/PoS simulator, difficulty slider, 51% attack
- **Nodes**: visualização de rede, nós honestos/atacantes/sybil, partition

### Web3 Lab
- **Tokens**: tokenomics, mint/burn, approval risks
- **Contracts**: visualização de contratos vulneráveis vs seguros com código
- **Vulnerabilities**: catálogo completo de 22 vulnerabilidades com detalhes

### DeFi Lab
- **DeFi**: overview de pools, TVL, bad debt, oracle health
- **DEX**: AMM x\*y=k, swap simulator, sandwich attack
- **Lending**: collateral, borrow, health factor, oracle manipulation, liquidação
- **Stablecoin**: colateral ratio, depeg simulator, circuit breaker
- **DAO**: proposals, voting, flash loan governance attack
- **NFT**: mint, metadata manipulation, marketplace risks
- **Bridge**: lock/mint, burn/release, message replay, validator compromise

### Audit Lab
- **Scanner**: resultados do scanner heurístico local, filtros, detalhes
- **Audit Builder**: construtor de relatório com scope, findings, status, preview
- **Reports**: relatórios de exemplo (smart contract, DeFi, bridge, wallet, protocol, DEX)
- **Settings**: configurações do simulador

## Dados Mockados

Todos os dados são mockados em `src/data/`. Não há conexão com blockchain real.

Arquivos:
- `dashboard.ts`, `chain.ts`, `wallet.ts`, `mempool.ts`, `nodes.ts`, `tokens.ts`
- `contracts.ts`, `vulnerabilities.ts` (inline no componente)
- `defi.ts`, `dex.ts`, `lending.ts`, `stablecoin.ts`, `dao.ts`, `nft.ts`, `bridge.ts`
- `scanner.ts`, `reports.ts`

## Integração Futura com API Rust

Os dados mockados podem ser substituídos por chamadas à API REST do core-chain Rust:

1. Criar camada de serviço em `src/lib/api.ts`
2. Implementar chamadas `fetch()` para endpoints Axum
3. Trocar `dataSource` no store de `"mock"` para `"local_api"`
4. Manter mock data como fallback

## Limitações

- Scanner heurístico — não substitui auditoria profissional
- Dados mockados — não refletem chains reais
- Sem conexão com mainnet — isolado por design
- Sem carteiras reais — tudo simulado
- Performance não otimizada para datasets massivos
- Foundry não estava disponível neste ambiente de QA; comandos `forge` não foram executados

## Segurança de Simulação

Textos e fluxos de risco foram revisados com os seguintes limites:

- Local simulation only.
- No real funds.
- No mainnet connection.
- Educational lab — not a replacement for manual security review.
- Demo seed — not a real wallet.

## QA

Ver:

- `QA.md` para checklist de qualidade.
- `QA_REPORT.md` para resultado do QA completo.
- `POLISH_REPORT.md` para revisão visual/UX.
- `ACCESSIBILITY_REPORT.md` para revisão de acessibilidade.
- `SECURITY_COPY_REVIEW.md` para revisão de copy de segurança.

## Screenshots

*Placeholder — adicionar screenshots após build.*

---

## Integração Comercial (Portfolio)

Este simulador serve como demonstrador de impacto visual e ferramenta estratégica em workshops executivos descritos no [Pacote Comercial do Portfólio (portfolio/)](file:///D:/Prg/CryptoSec-Lab/portfolio/README.md). Consulte o estudo de caso específico [Visual Threat Simulator as a Commercial Bridge](file:///D:/Prg/CryptoSec-Lab/portfolio/case-studies/frontend-simulator-case-study.md) para obter orientações detalhadas de apresentação.

---

**CryptoSec Lab** — Blockchain Security Educational Platform

