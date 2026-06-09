# Metodologia de Auditoria — CryptoSec Lab

## 1. Definição de Escopo (Scope Definition)

A definição de escopo é a etapa fundamental que estabelece os limites da auditoria. O auditor, em conjunto com o cliente, determina quais contratos inteligentes, módulos, componentes off-chain e funcionalidades serão analisados. São documentados o commit hash exato do código-fonte, a versão dos contratos, a rede-alvo (mainnet, testnet) e o número total de linhas de código (SLOC). Contratos auxiliares, bibliotecas externas e dependências também são catalogados.

Tudo que fica fora do escopo é explicitamente listado: testes unitários, scripts de deploy, frontend, documentação de usuário, e integrações com terceiros não auditadas. Essa delimitação evita ambiguidades e responsabilidades indefinidas. Qualquer suposição arquitetural (ex.: "assume-se que o oráculo retorna preços corretos") é registrada como pressuposto de auditoria.

O escopo é formalizado em um documento de definição de escopo assinado por ambas as partes. Alterações de escopo durante o engajamento passam por um processo de change request com reavaliação de prazos e custos.

---

## 2. Revisão de Arquitetura (Architecture Review)

A revisão de arquitetura analisa o design do sistema em alto nível antes da inspeção linha a linha. O auditor examina diagramas de componentes, fluxos de dados, modelo de permissões (roles), dependências externas (oráculos, bridges, tokens) e a estratégia de upgrade (proxy patterns, timelocks). O objetivo é identificar falhas estruturais que tornariam o sistema inseguro independentemente da qualidade da implementação.

São avaliados aspectos como: modelo de confiança (trust model), superfície de ataque, privilégios mínimos, segregação de responsabilidades e mecanismos de emergência (pause, emergency shutdown). O auditor verifica se o principio de defense-in-depth foi aplicado e se há single points of failure.

Problemas arquiteturais comuns incluem: admin keys sem timelock, oráculos centralizados, falta de rate limiting em funções críticas, dependência de sequenciadores centralizados em sistemas L2, e ausência de mecanismos de recuperação (recovery). Cada achado arquitetural é documentado com diagramas e justificativas.

---

## 3. Modelagem de Ameaças (Threat Modeling)

A modelagem de ameaças utiliza frameworks consolidados para identificar vetores de ataque de forma sistemática. O CryptoSec Lab aplica a metodologia STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) mapeada para contratos inteligentes e sistemas blockchain. Cada componente do sistema é avaliado contra cada categoria STRIDE.

Árvores de ataque (attack trees) são construídas para cenários críticos como drenagem de fundos, tomada de governança e manipulação de preços. O nó raiz é o impacto máximo (ex.: "perda total dos fundos dos usuários") e os nós filhos são condições necessárias. A árvore é refinada até chegar a primitivas (ex.: "reentrância na função withdraw", "oráculo manipulável com flash loan").

Modelos de adversário (adversary models) são definidos com diferentes capacidades: adversário externo (sem privilégios), adversário interno (usuário malicioso), adversário com capital (flash loans, bots MEV), e administrador malicioso (comprometimento de chaves). Para cada modelo, documenta-se o que o adversário pode e não pode fazer, e quais cenários de ataque são viáveis.

---

## 4. Revisão Manual de Código (Manual Code Review)

A revisão manual é o coração da auditoria. Engenheiros seniores inspecionam cada linha do código-fonte contratual, focando em vulnerabilidades conhecidas (reentrância, overflow/underflow, acesso não autorizado, front-running, oracle manipulation) e riscos específicos do domínio (lógica de empréstimos, cálculos de juros, liquidações, swaps).

O processo segue um checklist sistemático que cobre categorias como: controle de acesso (Ownable, RBAC), validação de inputs (require statements, bounds checking), manipulação de ativos externos (safeTransfer vs transfer), lógica de contabilidade (integridade de saldos), eventos (emissão correta), e uso de padrões (ERC20, ERC721, ERC4626).

Cada função é rastreada em uma planilha de revisão com status (revisada, pendente, com achado). Descobertas são imediatamente registradas com o trecho de código relevante, a linha exata e a justificativa da vulnerabilidade. A revisão manual é complementada, mas nunca substituída, por ferramentas automatizadas.

---

## 5. Varredura Automatizada (Automated Scanning)

Ferramentas de análise estática são executadas para identificar vulnerabilidades comuns de forma rápida e consistente. O CryptoSec Lab utiliza Slither (análise estática para Solidity), Mythril (symbolic execution), e Aderyn para detecção de padrões inseguros. Cada ferramenta é configurada com o nível de detecção máximo e os resultados são filtrados para remover falsos positivos.

A análise estática cobre: detecção de reentrância, uso inseguro de delegatecall, unchecked return values, exposição de funções internas, timestamp dependence, tx.origin abuse, variáveis não inicializadas, e visibilidade incorreta. Os resultados são exportados em formato JSON e correlacionados com os achados manuais.

Ferramentas de linting (Solhint, Ethlint) verificam conformidade com guias de estilo e boas práticas. Issues de baixa severidade (naming, organização) são registradas como informacionais. A pipeline de CI/CD do cliente deve integrar essas ferramentas para detecção precoce em futuros desenvolvimentos.

---

## 6. Testes Unitários e de Invariantes (Unit/Invariant Testing)

Testes unitários escritos em Foundry/Solidity são revisados quanto à completude e qualidade. O auditor verifica se as principais funcionalidades têm cobertura adequada, incluindo cenários de sucesso, falha esperada (reverts) e condições de borda (edge cases). Cobertura de linhas (line coverage) e branches são mensuradas com forge coverage.

Testes de invariantes (invariant tests) são executados para validar propriedades do sistema que devem se manter verdadeiras em qualquer estado. Exemplos: "a soma de todos os saldos deve ser igual ao total de ativos do contrato", "o preço do ativo nunca pode ser zero", "o totalSupply de LP tokens deve refletir a liquidez da pool". Foundry fuzzing é utilizado para gerar entradas aleatórias e explorar estados inesperados.

Os invariantes são executados com múltiplos atores simulados e sequências de transações randômicas (ghost variables, handlers). Qualquer quebra de invariante é tratada como um finding de alta ou crítica severidade. O relatório de auditoria documenta a cobertura de invariantes e quais propriedades foram validadas com sucesso.

---

## 7. Simulação de Ataques Econômicos (Economic Attack Simulation)

Ataques econômicos representam a classe de vulnerabilidades mais sofisticada em DeFi. O CryptoSec Lab simula ataques de flash loan combinados com manipulação de oráculo, sandwich attacks, liquidations maliciosas e ataques de governança. As simulações são implementadas em Foundry (fork de mainnet) ou usando scripts Python com dados on-chain reais.

Cenários típicos incluem: empréstimo instantâneo para inflar preço em pool com liquidez rasa, swap em DEX para manipular TWAP oracle antes de liquidação, ataques de dívida ruim (bad debt) em protocolos de empréstimo, ataques de precision loss em taxas acumuladas, e ataques de rent extraction via MEV (Miner Extractable Value).

Para cada simulação, documenta-se o capital necessário, o lucro potencial do atacante, a probabilidade de execução em mainnet (considerando concorrência de bots MEV), e contramedidas viáveis (limites de slippage, oráculos resistentes a manipulação, circuit breakers). Simulações de estresse (stress tests) com variação de parâmetros de mercado são realizadas para avaliar a robustez do protocolo.

---

## 8. Classificação de Achados (Findings Classification)

Cada vulnerabilidade descoberta recebe uma classificação de severidade baseada na combinação de impacto e probabilidade. O impacto avalia a consequência financeira, operacional e reputacional. A probabilidade considera a facilidade de exploração, os pré-requisitos necessários e se o ataque é conhecido publicamente.

A matriz de risco do CryptoSec Lab define cinco níveis: Critical (perda financeira imediata e certa), High (perda significativa provável), Medium (risco condicional a fatores externos), Low (baixo impacto, boas práticas), e Informational (recomendação sem impacto direto). Cada finding inclui justificativa detalhada da severidade atribuída.

O cliente pode contestar a classificação apresentando evidências de mitigação ou contexto adicional. O auditor reavalia e pode rebaixar ou elevar a severidade. Achados duplicados são consolidados. O rationale completo é mantido no registro de auditoria.

---

## 9. Orientação de Remediação (Remediation Guidance)

Para cada finding, o auditor fornece uma recomendação de correção clara, específica e acionável. A recomendação inclui: o trecho de código a ser modificado, a implementação sugerida (código corrigido ou pseudo-código), e referências a padrões de segurança (SWC Registry, OWASP, guidelines do próprio protocolo).

Remediações são classificadas por prioridade: correção imediata (pré-lançamento), correção em curto prazo (próximo upgrade), e melhoria contínua. Recomendações arquiteturais que exigem redesign significativo são apresentadas com análise de trade-offs (custo vs benefício, impacto em gas, impacto em usabilidade).

O auditor evita recomendações vagas como "melhorar segurança" ou "adicionar validação". Cada recomendação é testável e verificável. Quando múltiplas abordagens de correção existem, as vantagens e desvantagens de cada uma são discutidas para que o cliente tome a decisão informada.

---

## 10. Reteste (Retest)

Após o cliente implementar as correções, o auditor realiza um reteste focado. O reteste verifica especificamente cada finding reportado, confirmando que a vulnerabilidade foi eliminada e que nenhuma nova falha foi introduzida. A análise usa o mesmo commit hash do código corrigido.

O processo de reteste inclui: reexecução dos testes de invariantes com o novo código, nova varredura automatizada, simulação dos mesmos cenários de ataque que exploravam a vulnerabilidade original, e revisão manual das funções alteradas. Findings que não puderam ser reproduzidos no reteste são marcados como corrigidos.

Findings parcialmente corrigidos ou não corrigidos recebem status intermediário (Partially Fixed, Acknowledged) com justificativa do cliente. Riscos residuais são documentados no relatório final. O cliente pode solicitar múltiplas rodadas de reteste dentro do escopo acordado.

---

## 11. Relatório Final (Final Report)

O relatório final é o entregável principal da auditoria. Segue um formato profissional padronizado: página de capa com logotipos, sumário executivo, tabela de achados por severidade, escopo detalhado, metodologia aplicada, premissas e limitações, visão geral do sistema com diagrama de arquitetura, achados detalhados (cada um com ID, título, severidade, componente, descrição, impacto, probabilidade, prova de conceito, causa raiz, recomendação, referências e resultado do reteste), recomendações priorizadas, e apêndices (modelo de ameaças, cobertura de testes, changelog, referências externas).

O sumário executivo é escrito em linguagem não técnica para stakeholders de negócio. Inclui uma avaliação geral da postura de segurança do projeto (Ex.: "O protocolo apresenta 2 achados críticos que impedem o lançamento em mainnet. Recomendamos correção imediata seguida de novo reteste antes da implantação.").

O relatório é entregue em formato PDF e Markdown. O cliente pode optar por divulgação pública ou confidencial. A CryptoSec Lab mantém uma cópia selada com timestamp em blockchain para garantia de integridade e não-repúdio.

---

# Tipos de Auditoria

## Protocol Audit

Auditoria abrangente de um protocolo blockchain completo, incluindo camada de consenso, rede P2P, máquina de estados, e interfaces RPC. Foca em segurança a nível de protocolo: ataques de long-range, nothing-at-stake, eclipse attacks, censorship resistance, finalidade, e segurança econômica do mecanismo de consenso (slashing conditions, liveness, safety). Realizada para blockchains layer 1 e layer 2, sidechains, e rollups.

## Smart Contract Audit

Auditoria focada em contratos inteligentes individuais ou conjuntos de contratos que implementam lógica de negócio. Abrange vulnerabilidades do runtime da EVM (reentrância, integer overflow, acesso indevido), conformidade com padrões ERC, eficiência de gas, e lógica de negócio. É o tipo mais comum de auditoria, aplicável a qualquer projeto que implante contratos em blockchain.

## DeFi Audit

Auditoria especializada em protocolos de finanças descentralizadas. Vai além da segurança de contratos individuais para analisar interações econômicas entre múltiplos contratos e protocolos. Inclui análise de ataques econômicos (flash loans, manipulação de oráculo, ataques a liquidações, ataques a pools de liquidez), consistência de incentives, e sustentabilidade do modelo econômico (tokenomics, emissão, vesting).

## Wallet Audit (Software + Hardware)

Auditoria de carteiras digitais abrangendo software (extensões de navegador, mobile apps, web wallets) e hardware (dispositivos físicos como Ledger, Trezor). Para software: segurança de chaves privadas (derivação, armazenamento, backup), proteção contra phishing e malware, segurança da interface de usuário, comunicação RPC, e gerenciamento de transações (blind signing, domain validation). Para hardware: segurança do chip secure element, firmware, ataque de side-channel, supply chain security, e recuperação de seed phrase.

## Exchange Audit (CEX + DEX)

Para exchanges centralizadas (CEX): segurança de carteiras quentes e frias, cold storage policy, processos de KYC/AML, infraestrutura de servidores, APIs de trading, engine de matching, liquidação, e proteção contra ataques de withdrawal e insider threats. Para exchanges descentralizadas (DEX): segurança dos contratos de pool, lógica de swap, provisão de liquidez, proteção contra sandwich e front-running, manipulação de TWAP, e segurança da camada de governança.

## Bridge Audit

Auditoria de pontes entre blockchains (cross-chain bridges). Extremamente crítica devido ao histórico de explorações bilionárias. Abrange segurança dos validadores/relayers, mecanismo de consenso entre chains, lógica de lock/mint/burn/unlock, verificação de provas (SPV, Merkle proofs), manipulação de lightweight clients, finalidade entre chains, handling de forks/reorganizações, e mecanismos de emergência.

## Operational Security Review

Revisão de processos operacionais e de segurança da informação da equipe do projeto. Inclui segurança de chaves de administrador (multisig setup, signer custody), gestão de segredos (infura keys, deployer keys), práticas de CI/CD (segurança de pipelines, code review obrigatório), gestão de incidentes (playbook, comunicação), bug bounty program, insurance coverage, e compliance regulatório. É complementar às auditorias técnicas de código.
