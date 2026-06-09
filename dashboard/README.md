# CryptoSec Lab — Dashboard

Dashboard local para visualização de resultados de auditoria de smart contracts.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## Funcionalidades

- Cards com contagem por severidade (Critical, High, Medium, Low, Info)
- Tabela de findings com filtros por severidade e categoria
- Dados mockados em `src/data/findings.json`
- Design responsivo com tema escuro

## Como usar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Build para produção

```bash
npm run build
npm start
```

## Estrutura

```
dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css       # Estilos globais
│   │   ├── layout.tsx        # Layout raiz
│   │   └── page.tsx          # Página principal
│   ├── components/
│   │   ├── SeverityCard.tsx  # Card de contagem
│   │   └── FindingTable.tsx  # Tabela de findings
│   └── data/
│       ├── types.ts          # Tipos TypeScript
│       ├── findings.ts       # Import de dados
│       └── findings.json     # Dados mockados
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## ⚠️ Nota

Este dashboard é **educacional** e consome dados mockados. Não deve ser usado para monitoramento de produção sem adaptações.

Para propostas de serviços de segurança e templates comerciais associados, consulte o [Pacote de Portfólio Comercial (portfolio/)](file:///D:/Prg/CryptoSec-Lab/portfolio/README.md).

