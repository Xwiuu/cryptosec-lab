# CryptoSec Frontend Simulator — QA Plan

## 1. Build

```bash
npm run build
```

- [x] Build completo sem erros
- [x] Sem warnings críticos
- [x] 23 páginas estáticas geradas corretamente

## 2. TypeScript

```bash
npm run typecheck  # tsc --noEmit
```

- [x] Sem erros de tipo
- [x] `any` explícitos de tabelas/estado corrigidos
- [x] Imports corretos

## 3. Lint

```bash
npm run lint  # eslint .
```

- [x] Sem erros de lint
- [x] Sem variáveis não utilizadas
- [x] `next lint` substituído por ESLint CLI para Next 15+

## 3.1. Dependency Audit

```bash
npm audit --omit=dev
```

- [x] 0 vulnerabilidades em dependências de produção
- [x] Overrides aplicados para `dompurify` e `postcss`

## 4. Rotas

- [x] `/` — Dashboard carrega com métricas
- [x] `/chain` — Chain Explorer com blocos, tampering e validação
- [x] `/wallet` — Wallet Simulator com seed demo, mock signing e phishing warning
- [x] `/mempool` — Mempool Monitor com transações e spam simulation
- [x] `/mining` — PoW/PoS e 51% attack
- [x] `/nodes` — Network Nodes com status
- [x] `/tokens` — Token Lab com supply
- [x] `/contracts` — Contract Lab com Monaco/code viewer
- [x] `/vulnerabilities` — Vulnerability catalog
- [x] `/defi` — DeFi Overview
- [x] `/dex` — DEX/AMM Simulator com mock swap
- [x] `/lending` — Lending Pool com oracle/liquidation simulation
- [x] `/stablecoin` — Stablecoin Lab com depeg e circuit breaker
- [x] `/dao` — DAO Governance com secure/vulnerable attack outcome
- [x] `/nft` — NFT Lab com metadata freeze behavior
- [x] `/bridge` — Bridge Security com replay reject/pass by mode
- [x] `/scanner` — Scanner Dashboard com filtros e drawer
- [x] `/audit` — Audit Builder com seleção de findings e preview
- [x] `/reports` — Sample Reports
- [x] `/settings` — Lab Settings
- [x] Sidebar mantém item ativo entre rotas
- [x] Nenhum erro de hydration no build
- [x] Nenhum console.error crítico observado via build

## 5. Dados

- [x] Cards mostram valores numéricos coerentes
- [x] Tabelas renderizam com dados mockados
- [x] Filtros de severidade/categoria funcionam
- [x] Drawers abrem e fecham, inclusive com Escape
- [x] Botões de simulação disparam estados visuais
- [x] Sliders interativos funcionam (mining, dex)

## 6. Segurança de Comunicação

- [x] Nenhuma tela sugere usar carteira real
- [x] Nenhuma seed phrase real é gerada
- [x] Nenhum botão conecta mainnet
- [x] Avisos "Local Simulation" aparecem no StatusBar
- [x] Scanner exibe aviso de scanner heurístico/manual review
- [x] Wallet exibe aviso de demo seed/not a real wallet

## 7. Responsividade

- [x] Desktop (1024px+): sidebar fixa visível
- [x] Tablet (768-1023px): sidebar collapsible
- [x] Mobile (<768px): sidebar overlay, layout adaptado
- [x] Grids críticos colapsam corretamente
- [x] Tabelas com scroll horizontal controlado em mobile

## 8. Acessibilidade Básica

- [x] Contraste suficiente entre texto e fundo
- [x] Botões têm foco visível
- [x] Inputs têm labels ou `aria-label`
- [x] Navegação por teclado básica funcional
- [x] Links têm texto descritivo e sidebar usa `aria-current`

## 9. Animações

- [x] MetricCards animam ao entrar
- [x] Drawer abre/fecha suavemente
- [x] Sidebar transiciona em mobile
- [x] Timeline anima corretamente
- [x] Accordions expandem/recolhem
- [x] `prefers-reduced-motion` coberto via CSS

## 10. Erros Comuns

- [x] Nenhum `undefined is not an object`
- [x] Nenhum `cannot read property of undefined`
- [x] Nenhum erro de `map` em não-array
- [x] Nenhum loop infinito de render

## 11. Relatórios Gerados

- [x] `QA_REPORT.md`
- [x] `POLISH_REPORT.md`
- [x] `ACCESSIBILITY_REPORT.md`
- [x] `SECURITY_COPY_REVIEW.md`

---

## Scripts de Verificação Rápida

```bash
# 1. Build
cd frontend-simulator && npm run build

# 2. Health check das rotas (lista todas)
node -e "
const fs = require('fs');
const path = require('path');
const pages = fs.readdirSync('src/app', { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => '/' + d.name);
console.log('Rotas encontradas:', pages.length);
pages.forEach(p => console.log('  ' + p));
"

# 3. Verificar imports
rg "^import " src/app --no-heading | cut -d'/' -f1 | sort | uniq -c | sort -rn
```
