# CryptoSec Lab — Local Solidity Security Scanner

Scanner educacional local para análise estática de contratos Solidity. Parte do CryptoSec Lab, um laboratório educacional de blockchain security.

## ⚠️ Aviso Importante

Este scanner é uma **ferramenta educacional** que utiliza análise baseada em regex/heurística. **Não substitui** auditorias profissionais com ferramentas como Slither, Mythril ou revisão manual.

- ✅ Analisa apenas arquivos `.sol` locais
- ✅ Não envia código para serviços externos
- ✅ Não interage com mainnet/testnet
- ❌ Não detecta todas as vulnerabilidades
- ❌ Pode gerar falsos positivos
- ❌ Não substitui uma auditoria profissional

## Funcionalidades

- Escaneamento recursivo de diretórios com contratos Solidity
- 11 regras de segurança baseadas em padrões de vulnerabilidade conhecidos
- Geração de relatórios em Markdown
- Exportação JSON para processamento posterior
- Parsing de output do Foundry (`forge test`)
- Geração de relatório de auditoria combinado
- Classificação por severidade (Critical, High, Medium, Low, Informational)

## Regras Implementadas

| # | Regra | Categoria | Severidade Típica |
|---|-------|-----------|-------------------|
| 1 | Access Control | Access Control | High |
| 2 | Reentrancy | Reentrancy | High |
| 3 | tx.origin Usage | Access Control | Medium |
| 4 | Unchecked External Call | Error Handling | Medium |
| 5 | Delegatecall Usage | Architecture | High |
| 6 | Weak Randomness | Randomness | High |
| 7 | Timestamp Dependency | Timing | Medium/Low |
| 8 | Selfdestruct Usage | Architecture | High |
| 9 | Approval Risk | Token/Approval | Medium/Low |
| 10 | Upgradeability | Architecture | Critical |
| 11 | Oracle Risk | Oracle/Price Feed | High/Medium |

## Como Usar

### Escanear contratos Solidity

```bash
cargo run -- scan --path ../contracts/src --output ../reports/generated/scan-report.md
```

Opções:
- `--path` - Diretório ou arquivo `.sol` para escanear (default: `.`)
- `--output` - Arquivo de saída (Markdown ou JSON se extensão `.json`)
- `--min-severity` - Severidade mínima: Critical, High, Medium, Low, Informational (default: Informational)
- `--verbose` - Output detalhado

### Parsear output do Foundry

```bash
forge test -vvv > ../reports/generated/forge-output.txt
cargo run -- parse-foundry --input ../reports/generated/forge-output.txt
```

### Gerar relatório combinado

```bash
cargo run -- scan --path ../contracts/src --output ../reports/generated/scan-results.json
cargo run -- report --scan ../reports/generated/scan-results.json --out ../reports/generated/full-report.md
```

## Exemplos de Output

### Terminal
```
═══ CryptoSec Lab Scanner v0.1.0
┃ Starting security scan on: "../contracts/src"

INFO Found 56 Solidity file(s)

SCAN [1/56] Scanning ..\contracts\src\vulnerable\VulnerableBank.sol
  → 2 finding(s) (2 critical/high)

DONE Scan complete: 23 total finding(s)
OUT Report saved to: ..\reports\generated\scan-report.md
```

### Relatório Markdown
O relatório inclui:
- Executive Summary com contagem por severidade
- Escopo (arquivos analisados)
- Tabela de findings (ID, Severidade, Título, Arquivo, Linha)
- Detailed Findings com snippet de código e recomendação
- Recommendations agrupadas por categoria
- Appendix com classificação de severidade

## Limitações

1. **Análise baseada em regex** — não faz parsing AST completo do Solidity
2. **Falsos positivos** — algumas regras podem gerar alertas para código seguro
3. **Sem análise contextual** — não avalia o fluxo completo do programa
4. **Sem verificação de dependências** — não analisa bibliotecas externas
5. **Sem análise de gas** — não otimiza custos de execução
6. **Sem suporte a Vyper ou outras linguagens** — apenas Solidity

## Arquitetura

```
scanner/
├── Cargo.toml
├── README.md
└── src/
    ├── main.rs               # CLI (clap)
    ├── lib.rs                # Ponto de entrada da biblioteca
    ├── config.rs             # Configuração do scanner
    ├── finding.rs            # Estrutura de Finding
    ├── severity.rs           # Enum de Severity
    ├── parser.rs             # Leitura de arquivos .sol
    ├── solidity_scanner.rs   # Engine de escaneamento
    ├── foundry_parser.rs     # Parser de output do Foundry
    ├── report_generator.rs   # Geração de relatórios
    ├── rules/
    │   ├── mod.rs            # Trait Rule e registro de regras
    │   ├── access_control.rs
    │   ├── reentrancy.rs
    │   ├── tx_origin.rs
    │   ├── unchecked_call.rs
    │   ├── delegatecall.rs
    │   ├── randomness.rs
    │   ├── timestamp.rs
    │   ├── selfdestruct.rs
    │   ├── approval_risk.rs
    │   ├── upgradeability.rs
    │   └── oracle_risk.rs
    ├── tests/
    │   ├── mod.rs
    │   ├── scanner_tests.rs
    │   ├── parser_tests.rs
    │   └── report_tests.rs
    └── fixtures/
        ├── VulnerableBank.sol
        ├── VulnerableToken.sol
        ├── VulnerableRandomness.sol
        └── VulnerableUpgradeable.sol
```

## Relacionamento com o Portfólio Comercial

Os resultados gerados por este scanner local heurístico atuam como triagem inicial de código nos serviços comerciais descritos no [Pacote Comercial do Portfólio (portfolio/)](file:///D:/Prg/CryptoSec-Lab/portfolio/README.md), auxiliando a estruturar os relatórios de vulnerabilidades iniciais apresentados aos clientes.

## Licenciamento

Propriedade intelectual da CryptoSec Lab. Uso educacional permitido.

