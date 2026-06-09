# Modelo de Precificação e Escopo (Pricing Model) — Web3 Security

Este documento apresenta a estrutura de precificação por faixas de complexidade técnica e os multiplicadores de risco utilizados para calcular os honorários de serviços de auditoria de contratos inteligentes.

---

## 1. Faixas de Precificação (Tiers Estimados)

Os valores abaixo são indicativos e variam de acordo com o total de linhas de código fonte úteis (nLoC - Normalized Lines of Code) e o grau de complexidade matemática/econômica do projeto.

### Tier 1: Starter Review
*   **Foco:** Contratos simples (Tokens ERC20/ERC721 básicos, contratos de staking lineares, vaults sem automação).
*   **Volume de Código:** Até 500 nLoC.
*   **Entregáveis:** Relatório técnico simplificado de vulnerabilidades + 1 reteste.
*   **Duração:** 1 a 2 semanas.
*   **Faixa de Preço Indicativa:** USD $3.000 - $6.000.

### Tier 2: Standard Audit
*   **Foco:** Aplicações descentralizadas tradicionais (DApps de governança, NFTs com dinâmicas de revelação avançadas, cofres de depósitos multifuncionais).
*   **Volume de Código:** 500 a 1.500 nLoC.
*   **Entregáveis:** Relatório técnico completo, PoC de exploits (Foundry) + 1 reteste + suporte a deploy básico.
*   **Duração:** 2 a 3 semanas.
*   **Faixa de Preço Indicativa:** USD $7.000 - $15.000.

### Tier 3: Advanced DeFi Review
*   **Foco:** Ecossistemas financeiros complexos (AMMs proprietários, pools de empréstimos colaterais, stablecoins algorítmicas, yield farming com regras de recompensa dinâmicas).
*   **Volume de Código:** 1.500 a 3.500 nLoC.
*   **Entregáveis:** Relatório completo de riscos de código e vulnerabilidades de incentivo econômico, testes de stress de oráculo e fuzzing de estado.
*   **Duração:** 3 a 5 semanas.
*   **Faixa de Preço Indicativa:** USD $16.000 - $35.000.

### Tier 4: Bridge / Protocol Deep Review
*   **Foco:** Pontes cross-chain estruturais, soluções de custódia corporativa e modificações nos clientes de consenso de redes L1/L2.
*   **Volume de Código:** Acima de 3.500 nLoC ou código de baixo nível (Rust/Go).
*   **Entregáveis:** Auditoria formal de assinaturas, modelagem matemática completa de consenso e verificação criptográfica.
*   **Duração:** 5 a 8 semanas.
*   **Faixa de Preço Indicativa:** USD $40.000+ (sob consulta de escopo).

---

## 2. Outros Modelos de Contratação

### Retainer Mensal (Suporte de Segurança Contínuo)
*   **Foco:** Equipes em desenvolvimento ativo que necessitam de revisões recorrentes de novos commits, revisões de atualizações semanais e assessoria contínua.
*   **Escopo:** Horas reservadas de engenharia de segurança por mês (ex: 20 a 40 horas/mês).
*   **Investimento:** USD $4.000 - $8.000 / mês (mínimo de 3 meses de contratação).

### Executive Risk Workshop (Educação Executiva)
*   **Foco:** Alinhamento de riscos C-Level para investidores e diretores de Fintechs tradicionais que estão integrando Web3.
*   **Entregáveis:** Sessão síncrona demonstrativa usando o CryptoSec Simulator, manual de boas práticas operacionais básicas.
*   **Investimento:** USD $3.000 - $5.000 por workshop.

---

## 3. Fatores de Aumento de Preço (Multiplicadores de Complexidade)

O preço base do nLoC é multiplicado por taxas adicionais de risco quando o repositório apresenta os seguintes fatores:

| Fator | Impacto no Preço | Raciocínio Técnico |
| :--- | :--- | :--- |
| **Ausência de Testes Locais** | +20% a +30% | A nossa equipe precisará escrever suites de testes básicas do zero apenas para mapear comportamentos normais antes de auditar. |
| **Documentação Ruim / Inexistente** | +15% a +25% | Aumenta o tempo necessário para engenharia reversa e reuniões de alinhamento com a equipe do cliente. |
| **Urgência Crítica (Prazo Curto)** | +30% a +50% | Exige alocação exclusiva e horas extras imediatas de analistas sêniores. |
| **Arquitetura Upgradeable** | +15% | Proxies adicionam complexidade no mapeamento de colisões de variáveis e inicializações tardias. |
| **Pontes (Bridges) e Criptografia Customizada**| +25% | Exige especialistas em matemática de curvas criptográficas e validação de chaves. |
| **TVL Esperado Elevado (>$10M)** | +20% | Aumenta a responsabilidade de análise de risco e a necessidade de rodadas redundantes de auditoria manual de pares. |
| **Necessidade de Múltiplos Retestes** | +15% por rodada | Cada validação extra de correções exige recompilação, revisão lógica de novos trechos e relatórios atualizados. |
