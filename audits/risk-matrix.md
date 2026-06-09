# Matriz de Risco — CryptoSec Lab

## Visão Geral

A Matriz de Risco do CryptoSec Lab é o framework padronizado para classificação de vulnerabilidades encontradas durante auditorias. A severidade de cada finding é determinada pela combinação de dois eixos: **Impacto** (consequência da exploração) e **Probabilidade** (facilidade de exploração).

Este sistema garante consistência entre diferentes auditorias e permite que clientes priorizem correções de forma objetiva.

---

## Classificação de Impacto

| Nível | Descrição | Exemplos |
|-------|-----------|----------|
| **Perda Total de Fundos** | Drenagem completa de ativos do protocolo ou de usuários. Perda irreversível. | Reentrância que permite sacar todo o TVL; bug em ponte que permite mint ilimitado na chain destino. |
| **Perda Significativa** | Perda financeira parcial mas substancial. Pode afetar um subconjunto de usuários ou operações. | Manipulação de oráculo que permite liquidar posições saudáveis; falha em taxa que permite extrair valor de um pool. |
| **Bloqueio Temporário** | Fundos ficam inacessíveis por um período, sem perda permanente. | Função de saque travada por bug; pause acidental sem unpause; dependência de oráculo que para de atualizar. |
| **Tomada de Governança** | Adversário obtém controle administrativo sobre parâmetros ou fundos do protocolo. | Tomada de DAO via proposal maliciosa; comprometimento de admin key sem timelock; flash loan attack em governance token. |
| **Exposição de Dados** | Informações sensíveis são reveladas a partes não autorizadas. | Privacidade de transações comprometida em zk-rollup; vazamento de se credenciais em eventos blockchain. |
| **Dano Reputacional** | Impacto na confiança do mercado e usuários sem perda financeira direta. | Front-running por validadores; manipulação de leaderboard; falta de transparência em taxas. |
| **Insolvência do Protocolo** | Protocolo torna-se incapaz de honrar suas obrigações financeiras. | Bad debt acumulado não colateralizado; desequilíbrio entre ativos e passivos; liquidações impossibilitadas. |

---

## Classificação de Probabilidade

| Nível | Descrição | Pré-requisitos |
|-------|-----------|----------------|
| **Trivial** | Exploração direta e imediata. Qualquer usuário pode executar sem capital ou conhecimento especializado. | Nenhum pré-requisito. Ataque executável em transação única. Ex: chamar função sem acesso controlado. |
| **Fácil** | Exploração possível com capital moderado ou conhecimento básico de contratos inteligentes. | Acesso a flash loan (para manipular liquidez) ou conhecimento de blockchain. Ex: sandwich attack sem proteção de slippage. |
| **Moderado** | Requer condições específicas de mercado, capital significativo, ou conhecimento avançado. | Múltiplas transações coordenadas, ferramentas MEV, ou engenharia reversa de lógica complexa. Ex: manipulação de TWAP com múltiplos blocos. |
| **Difícil** | Cenário que exige múltiplas condições simultâneas, capital muito alto, ou colusão de validadores. | Ataque requiring >50% do TVL, sequestro de validador, ou exploração de condição de borda rara. Ex: ataque de gover nança com 51% dos tokens. |
| **Teórico** | Viabilidade matemática ou teórica, mas impraticável no cenário real devido a restrições econômicas ou técnicas. | Capital superior ao mercado total, ataque requiring colusão global de miners, ou vulnerabilidade em primitiva criptográfica não quebrada. Ex: ataque de 51% em Bitcoin. |

---

## Matriz de Severidade

A severidade final é determinada pela tabela abaixo:

| Impacto \ Probabilidade | Trivial | Fácil | Moderado | Difícil | Teórico |
|:-----------------------:|:-------:|:-----:|:--------:|:-------:|:-------:|
| **Perda Total de Fundos** | **Critical** | **Critical** | **Critical** | **High** | **High** |
| **Perda Significativa** | **Critical** | **High** | **High** | **Medium** | **Medium** |
| **Bloqueio Temporário** | **High** | **High** | **Medium** | **Low** | **Low** |
| **Tomada de Governança** | **Critical** | **High** | **High** | **Medium** | **Medium** |
| **Exposição de Dados** | **High** | **Medium** | **Medium** | **Low** | **Informational** |
| **Dano Reputacional** | **Medium** | **Medium** | **Low** | **Low** | **Informational** |
| **Insolvência do Protocolo**| **Critical** | **Critical** | **High** | **High** | **Medium** |

---

## Tabela de Severidades

### Critical

| Campo | Descrição |
|-------|-----------|
| **Definição** | Vulnerabilidade que resulta em perda financeira imediata e certa de fundos do protocolo ou de usuários. Exploração direta, sem pré-requisitos significativos. |
| **Exemplo** | Reentrância em função `withdraw()` que atualiza saldo após transferência externa, permitindo drenagem completa. Função `mint()` sem acesso controlado que permite criação ilimitada de tokens. |
| **SLA para Correção** | Imediato — correção obrigatória antes de qualquer deploy em mainnet. |
| **Recomendação** | Pausar contratos se possível. Implementar correção e solicitar reteste urgente. Não lançar em produção enquanto não corrigido. |

### High

| Campo | Descrição |
|-------|-----------|
| **Definição** | Vulnerabilidade grave que pode causar perda financeira significativa ou comprometimento sério da operação do protocolo. Exploração possível sob condições específicas. |
| **Exemplo** | Ausência de proteção contra sandwich attack em DEX (sem `minAmountOut`). Timelock insuficiente em função de governo que permite mudança de parâmetros crítica sem aviso. |
| **SLA para Correção** | Urgente — correção recomendada antes do deploy em mainnet. Máximo de 7 dias após reporte para projetos em produção. |
| **Recomendação** | Priorizar correção no próximo deploy. Se em produção, avaliar necessidade de pausa temporária. |

### Medium

| Campo | Descrição |
|-------|-----------|
| **Definição** | Risco moderado que pode causar impactos limitados sob condições específicas ou combinado com outras vulnerabilidades. Requer fatores externos para exploração. |
| **Exemplo** | Falta de verificação de retorno em `transfer()` para token que não reverte em falha. Ausência de minimum liquidity em pool AMM que permite manipulação pelo primeiro depositante. |
| **SLA para Correção** | Programado — correção dentro do próximo ciclo de desenvolvimento (30 dias recomendado). |
| **Recomendação** | Corrigir no próximo upgrade regular do contrato. Documentar risco para operadores. |

### Low

| Campo | Descrição |
|-------|-----------|
| **Definição** | Baixo impacto na segurança geral. Geralmente violação de boas práticas ou riscos marginais. Não ameaça fundos ou operação. |
| **Exemplo** | Evento não emitido em função que altera estado. Uso de `transfer()` ao invés de `safeTransfer()` para ETH (que funciona mas é menos seguro). Nome de variável inconsistente. |
| **SLA para Correção** | Conveniente — correção na próxima oportunidade de deploy. Pode ser acumulado com outras correções. |
| **Recomendação** | Corrigir como parte da manutenção regular do código. |

### Informational

| Campo | Descrição |
|-------|-----------|
| **Definição** | Recomendação ou observação sem impacto direto na segurança. Inclui sugestões de melhoria, otimização de gas, e boas práticas não críticas. |
| **Exemplo** | Função marcável como `external` ao invés de `public` para economia de gas. Recomendação de documentação adicional em NatSpec. |
| **SLA para Correção** | Não aplicável — recomendação para melhoria contínua. |
| **Recomendação** | Avaliar e implementar quando conveniente. Utilizar como input para evolução do código. |

---

## Exceções e Casos Especiais

### Elevação de Severidade

Uma vulnerabilidade pode ter sua severidade elevada se:
- O código afetado está em um contrato que movimenta alto valor (TVL > US$10M).
- O ataque pode ser combinado com outros findings para um efeito catastrófico (chain of exploits).
- O protocolo não possui mecanismos de emergência (pause, emergency shutdown).
- O código está prestes a ser implantado em mainnet sem histórico de testes em produção.

### Redução de Severidade

Uma vulnerabilidade pode ter sua severidade reduzida se:
- O pré-requisito para exploração é improvável no contexto real de uso.
- O cliente demonstra que uma mitigação compensatória já está em vigor (ex.: monitoramento off-chain que detectaria o ataque).
- O custo de exploração supera o ganho potencial do atacante (análise econômica).

---

## Processo de Classificação

1. **Identificação do Achado** — O engenheiro documenta a vulnerabilidade com PoC.
2. **Avaliação de Impacto** — Determina-se a categoria de impacto na tabela acima.
3. **Avaliação de Probabilidade** — Determina-se o nível de probabilidade.
4. **Cruzamento na Matriz** — A severidade é lida diretamente da Matriz de Risco.
5. **Peer Review** — Um segundo engenheiro sênior revisa e valida a classificação.
6. **Comunicação ao Cliente** — A severidade é reportada com justificativa completa.
7. **Reavaliação** — O cliente pode apresentar contexto adicional para reavaliação.

---

## Referências

- SWC Registry: https://swcregistry.io/
- Immunefi Severity Classification System
- OWASP Risk Rating Methodology
- Certora Verification Standard
