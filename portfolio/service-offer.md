# Catálogo de Serviços de Consultoria — CryptoSec Lab

Este documento detalha o portfólio de serviços oferecidos pela nossa consultoria, cobrindo o escopo técnico, entregáveis, durações estimadas e pré-requisitos para cada modalidade.

---

## Matriz Resumida de Serviços

| Serviço | Ideal para | Entregáveis Principais | Complexidade |
| :--- | :--- | :--- | :--- |
| **Smart Contract Security Review** | Protocolos Solidity/Rust em fase de pré-lançamento | Relatório Técnico de Vulnerabilidades e Reteste | Média a Alta |
| **DeFi Protocol Risk Review** | Pools de Lending, Yield Farms, AMMs complexos | Relatório de Vetores Econômicos e Fuzzing de Estado | Alta |
| **DEX/AMM Security Review** | Criadores de AMM e forks de Uniswap | Testes de Desvio de Preço e Análise de Liquidez | Média |
| **Bridge Security Review** | Protocolos cross-chain e tokens multichain | Análise de Validação e Assinaturas Cryptográficas | Crítica |
| **Wallet & Custody Review** | Neobanks, Exchanges, Custodiantes Web3 | Relatório de Gestão de Chaves e Armazenamento | Alta |
| **Blockchain Protocol Review** | Novas L1/L2 e redes corporativas | Validação de Consenso e Resiliência P2P/Mempool | Crítica |
| **Tokenomics & Governance Risk Review** | DAOs e tokens com direitos de voto | Simulações de Ataques de Governança e Flash Loan | Média |
| **Exchange Security Review** | Fintechs que negociam ativos digitais | Auditoria de Fluxo de Caixa e Integração de APIs | Média a Alta |
| **Web3 Operational Security Review** | Startups Web3 e equipes descentralizadas | Checklist de OpsSec e Análise de Acesso IAM | Média |
| **Pre-launch Security Assessment** | Projetos prontos para deploy em mainnet | Checklist Final de Deploy e Suporte no Go-Live | Média |
| **Security Education Workshop** | Diretores C-Level e equipes de engenharia | Treinamento Técnico e Simulação no Simulador | Baixa |

---

## Detalhamento de Serviços

### 1. Smart Contract Security Review
*   **Descrição:** Análise profunda, linha a linha, da lógica de execução de contratos inteligentes escritos em Solidity ou Rust (Vyper opcional). Identifica vulnerabilidades de lógica de negócios, reentrância, controle de acesso e riscos de upgrade.
*   **Indicado para:** Startups Web3, projetos de NFT, DApps em geral e tokens de utilidade.
*   **Escopo comum:** Revisão manual do código-fonte correspondente a um commit hash congelado; testes unitários complementares no Foundry; modelagem estática de grafos de chamadas.
*   **Entregáveis:** Relatório Técnico Inicial, Pull Requests de sugestão de mitigação e Relatório Final pós-reteste.
*   **O que não está incluso:** Correção direta do código no repositório de produção do cliente; reescrita de código de terceiros (como bibliotecas importadas não modificadas).
*   **Duração estimada:** 2 a 4 semanas.
*   **Riscos avaliados:** Reentrância, controle de acesso indevido, overflow/underflow aritmético, vazamento de privilégios de owner e falhas de inicialização em proxies.
*   **Pré-requisitos:** Documentação clara de arquitetura (ReadMe ou Whitepaper), suite de testes verde (passando localmente) e commit hash específico.

### 2. DeFi Protocol Risk Review
*   **Descrição:** Avaliação sistêmica dos riscos inerentes a protocolos DeFi que envolvem interações complexas de depósitos, empréstimos (Lending), rendimento (Yield Farming) e manipulação financeira.
*   **Indicado para:** Protocolos de Lending, Stablecoins Algorítmicas, Agregadores de Yield e Derivativos.
*   **Escopo comum:** Análise matemática de fórmulas de precificação, simulação de stress financeiro e cenários de flash loan oracle manipulation.
*   **Entregáveis:** Relatório Técnico de Risco DeFi e Script de Fuzzing de Estado para validação de invariantes matemáticas.
*   **O que não está incluso:** Auditoria dos contratos de UI/frontend (a menos que contratada separadamente) e análises de viabilidade econômica puramente de mercado.
*   **Duração estimada:** 3 a 5 semanas.
*   **Riscos avaliados:** Insolvência do pool de lending, liquidações injustas por manipulação de spot oracles, depeg de stablecoin e ataques de empréstimos relâmpago.
*   **Pré-requisitos:** Fórmulas matemáticas de precificação documentadas e especificações de colaterais aceitos.

### 3. DEX/AMM Security Review
*   **Descrição:** Auditoria focada no fluxo de swaps, provisionamento de liquidez, cálculo de taxas, controle de slippage e vulnerabilidade a ataques sanduíche.
*   **Indicado para:** Plataformas de Swap, criadores de liquidez concentrada e forks de AMMs tradicionais.
*   **Escopo comum:** Testes de slippage agressivos, simulações de arbitragem e verificação da integridade das reservas matemáticas (fórmula do produto constante).
*   **Entregáveis:** Relatório de Segurança de AMM e conjunto de testes Foundry que provam a robustez do cálculo de slippage.
*   **O que não está incluso:** Criação de bots de arbitragem comercial e análise de impermanent loss para fins tributários.
*   **Duração estimada:** 2 a 3 semanas.
*   **Riscos avaliados:** Front-running/MEV, roubo de taxas acumuladas, drenagem de liquidez por arredondamento matemático e ataques sanduíche.
*   **Pré-requisitos:** Modelos de taxas e curvas de ligação (bonding curves) especificados.

### 4. Bridge Security Review
*   **Descrição:** Avaliação técnica minuciosa de pontes de ativos digitais (pontes cross-chain), que representam alguns dos maiores alvos de hack em Web3.
*   **Indicado para:** Emissores de tokens multichain, redes L1/L2 com pontes nativas e agregadores interoperáveis.
*   **Escopo comum:** Revisão dos contratos de bloqueio/emissão (Lock/Mint), validadores de estado off-chain, esquemas de assinatura multisig e regras de domain separation de assinaturas.
*   **Entregáveis:** Relatório de Auditoria de Ponte e validação criptográfica de assinaturas off-chain.
*   **O que não está incluso:** Testes de penetração em toda a infraestrutura física de nuvem dos validadores individuais.
*   **Duração estimada:** 4 a 6 semanas.
*   **Riscos avaliados:** Replay attacks de mensagens cross-chain, falsificação de provas de depósito, assinaturas inválidas aceitas e sequestro de chaves de validadores.
*   **Pré-requisitos:** Documentação completa da arquitetura da ponte e descrição do ciclo de vida das mensagens cross-chain.

### 5. Wallet & Custody Security Review
*   **Descrição:** Análise de segurança no ecossistema de custódia e carteiras digitais, cobrindo o gerenciamento de chaves privadas e assinaturas criptográficas.
*   **Indicado para:** Exchanges, carteiras não-custodiais, fintechs e soluções corporativas de custódia.
*   **Escopo comum:** Testes de entropia na geração de seeds, validação de armazenamento local seguro de credenciais, auditoria de integrações HSM/MPC.
*   **Entregáveis:** Relatório de Auditoria de Custódia e Arquitetura de Chaves.
*   **O que não está incluso:** Auditorias físicas nas instalações do cliente.
*   **Duração estimada:** 3 a 5 semanas.
*   **Riscos avaliados:** Roubo ou vazamento de chaves privadas, armazenamento inseguro local (LocalStorage/SharedPreferences), engenharia social para roubo de sementes e vulnerabilidades no esquema MPC (Multi-Party Computation).
*   **Pré-requisitos:** Diagramas de arquitetura de custódia e código das SDKs de carteira utilizadas.

### 6. Blockchain Protocol Review
*   **Descrição:** Auditoria de baixo nível do protocolo de blockchain em si, cobrindo regras de consenso, validação de transações no mempool e armazenamento.
*   **Indicado para:** Projetos criando blockchains L1/L2 proprietárias, redes privadas baseadas em Cosmos SDK, Substrate ou arquiteturas customizadas.
*   **Escopo comum:** Análise do código-fonte do nó do protocolo (Go/Rust/C++), simulação de forks e ataques de spam.
*   **Entregáveis:** Relatório de Integridade do Protocolo de Consenso.
*   **O que não está incluso:** Avaliação de estabilidade elétrica ou física da rede global de mineradores/validadores.
*   **Duração estimada:** 5 a 8 semanas.
*   **Riscos avaliados:** Bifurcações maliciosas (Difficulty Bypass), mempool spamming que trava nós, ataques de gasto duplo e vulnerabilidades de criptografia fraca (weak hash).
*   **Pré-requisitos:** Especificação formal do protocolo e código-fonte completo do cliente de rede.

### 7. Tokenomics & Governance Risk Review
*   **Descrição:** Avaliação lógica do design de governança de DAOs, contratos de votação, distribuição de tokens (vesting) e susceptibilidade a sequestro de governança.
*   **Indicado para:** DAOs com tesourarias expressivas e protocolos lançando tokens de governança.
*   **Escopo comum:** Simulação de aquisição rápida de direitos de voto via flash loans e análise de prazos de timelock.
*   **Entregáveis:** Relatório de Vulnerabilidade de Governança e Proposta de Parâmetros de Quórum.
*   **O que não está incluso:** Avaliação sobre a atratividade comercial ou design econômico de taxas do token.
*   **Duração estimada:** 2 a 3 semanas.
*   **Riscos avaliados:** Ataques de governança via flash loans, manipulação de snapshots, quóruns baixos e bypassing de timelocks administrativos.
*   **Pré-requisitos:** Contratos de token e governança definidos, regras de governança social documentadas.

### 8. Exchange Security Review
*   **Descrição:** Revisão de integrações de chaves, gerenciamento de depósitos e saques de criptoativos e conexões via APIs com fontes de liquidez.
*   **Indicado para:** Corretoras tradicionais de ativos digitais e intermediadores de pagamento cripto-fiat.
*   **Escopo comum:** Teste de penetração nas APIs, análise de limites de transferência on-chain e reconciliação de saldo.
*   **Entregáveis:** Relatório de Auditoria de Integração e APIs de Troca.
*   **O que não está incluso:** Varredura física de rede interna corporativa não conectada aos serviços cripto.
*   **Duração estimada:** 3 a 4 semanas.
*   **Riscos avaliados:** Drenagem de carteiras quentes (hot wallets), roubo de chaves de API de terceiros e bypass de regras de limite de saque diário.
*   **Pré-requisitos:** APIs documentadas e acesso a um ambiente de homologação idêntico ao de produção.

### 9. Web3 Operational Security Review
*   **Descrição:** Análise de práticas internas da equipe de desenvolvimento e administração do protocolo, focando em segurança operacional (OpsSec).
*   **Indicado para:** Startups Web3 descentralizadas ou centralizadas.
*   **Escopo comum:** Auditoria de acessos IAM a plataformas cloud, práticas de backup de chaves multisig operacionais e resposta a incidentes.
*   **Entregáveis:** Manual de Resposta a Incidentes customizado e Relatório de Diagnóstico OpsSec.
*   **O que não está incluso:** Treinamentos de segurança física tradicional contra sequestros ou invasão predial.
*   **Duração estimada:** 2 a 3 semanas.
*   **Riscos avaliados:** Comprometimento de chaves administrativas por ataques de phishing direcionado, perda de backups de multisigs e ausência de procedimentos de pausa emergencial.
*   **Pré-requisitos:** Acesso (por compartilhamento de tela ou documentação) aos diagramas de processos de governança de TI.

### 10. Pre-launch Security Assessment
*   **Descrição:** Um crivo final e dinâmico feito nos dias anteriores ao deploy em produção para garantir que todas as pontas estejam devidamente amarradas.
*   **Indicado para:** Equipes que já realizaram auditorias completas e estão a 1-2 semanas do lançamento do projeto.
*   **Escopo comum:** Checagem final de parâmetros de deploy, chaves de multisig iniciais, timelocks ativados e teste de "dry run" na testnet.
*   **Entregáveis:** Checklist Pré-Launch validado por engenheiro e Relatório de Conformidade de Lançamento.
*   **O que não está incluso:** Uma auditoria completa de lógica de código do zero (deve ser contratada antes).
*   **Duração estimada:** 1 semana.
*   **Riscos avaliados:** Parâmetros incorretos passados no construtor dos contratos, chaves admin de teste deixadas ativas e ausência de oráculos na rede principal.
*   **Pré-requisitos:** Relatórios de auditorias anteriores anexados e repositório final de deploy.

### 11. Security Education & Executive Risk Workshop
*   **Descrição:** Workshops imersivos desenhados para treinar a gerência e engenheiros nas maiores ameaças técnicas e de negócios em Web3.
*   **Indicado para:** Diretoria de fintechs, equipes de desenvolvimento e investidores Web3.
*   **Escopo comum:** Sessões dinâmicas utilizando o **CryptoSec Simulator** para vivenciar vetores de ataque reais sem tocar em fundos reais.
*   **Entregáveis:** Slides de treinamento customizados, Gravação do workshop e Certificados de Participação.
*   **O que não está incluso:** Qualquer tipo de assessoria jurídica ou de compliance de valores mobiliários.
*   **Duração estimada:** 2 a 3 dias (sessões síncronas de 2 a 4 horas).
*   **Riscos avaliados:** Falta de preparo para lidar com crises de drenagem de fundos, desconhecimento C-level de riscos técnicos de pontes e oráculos.
*   **Pré-requisitos:** Alinhamento prévio sobre as principais tecnologias que o cliente utiliza ou planeja utilizar.
