# Roteiro de Call de Descoberta (Discovery Call Script) — Web3 Security

Este documento fornece um roteiro estruturado para qualificação comercial e levantamento de escopo técnico durante a reunião inicial com potenciais clientes de serviços de auditoria de segurança blockchain.

---

## Estrutura da Reunião (Duração: 30 Minutos)

### 1. Abertura e Alinhamento (3 min)
*   **Objetivo:** Estabelecer rapport, confirmar a agenda da reunião e explicar o propósito da conversa (entender os desafios técnicos do projeto para formatar uma proposta direcionada).
*   *Script de fala sugerido:*
    > *"Olá [Nome do Founder/CTO], obrigado pelo tempo hoje. O objetivo principal deste nosso bate-papo é entender a arquitetura do seu protocolo, o estágio atual do desenvolvimento e as prioridades de segurança do lançamento. Ao final, se fizer sentido para ambos os lados, traçamos os próximos passos para estruturar uma proposta comercial detalhada de revisão técnica."*

### 2. Contexto da Empresa e Produto (5 min)
*   **Objetivo:** Entender a visão de negócios do projeto, quem é o público-alvo e a dinâmica de mercado que estão buscando.
*   *Perguntas de suporte:*
    *   Como vocês resumem a proposta de valor do protocolo em uma frase?
    *   Qual rede blockchain vocês escolheram para o deploy principal e por quê?

### 3. Diagnóstico e Escopo Técnico (12 min)
*   **Objetivo:** Mapear a complexidade do repositório de código e preencher a ficha técnica de risco.
*   *Perguntas Qualificadoras (Checklist Técnico de Risco):*
    1.  **Arquitetura de Contratos:** Os contratos inteligentes são atualizáveis (upgradeable)? Se sim, qual padrão de proxy estão utilizando (UUPS, Transparent)?
    2.  **Controle de Acesso:** Como funciona o controle de privilégios admin? Existe uma chave única, um comitê multisig (ex: Gnosis Safe) ou um controle de governança on-chain?
    3.  **Mecanismos de Bloqueio:** Há um bloqueio de tempo (timelock) configurado para alterações administrativas críticas? Existe função de pausabilidade emergencial?
    4.  **Integração de Oráculos:** O protocolo depende de dados de preços externos? Se sim, estão consultando oráculos descentralizados (Chainlink) ou pools de AMM diretamente?
    5.  **Pontes Cross-Chain:** Existe alguma ponte (bridge) própria ou integração cross-chain para transferir ativos entre redes?
    6.  **Componentes Financeiros:** O protocolo envolve emissão de stablecoins, motores de liquidação, pools de empréstimo (lending) ou dinâmicas de corretora descentralizada (DEX/AMM)?
    7.  **Estado do Repositório:** O escopo do código já está congelado (code freeze) ou ainda há desenvolvimento de funcionalidades ativas? Qual é o commit hash exato a ser auditado?
    8.  **Testes e Documentação:** Qual é a cobertura atual de testes automatizados (Foundry, Hardhat)? Vocês possuem um manual de arquitetura técnica ou whitepaper atualizado?

### 4. Riscos Percebidos e Histórico (3 min)
*   *Perguntas de suporte:*
    *   Quais áreas do código tiram o sono de vocês hoje?
    *   Já passaram por alguma auditoria ou revisão de segurança anterior? Se sim, quais foram os principais achados?
    *   O projeto já opera em testnet ou mainnet de forma simplificada? Já ocorreu algum comportamento atípico ou incidente técnico anterior?

### 5. Parâmetros de Projeto: Timeline, Budget e Decisão (4 min)
*   *Perguntas de suporte:*
    *   Qual é a data planejada para o lançamento em produção (mainnet)?
    *   Existe algum parceiro institucional, exchange ou fundo de capital de risco (VC) exigindo a entrega do relatório de segurança para aprovação de listagem ou investimento?
    *   Vocês já definiram um orçamento estimado alocado especificamente para revisões de segurança?
    *   Quem são as pessoas chaves que participarão da aprovação e assinatura do contrato de auditoria?

### 6. Próximos Passos (3 min)
*   *Script de fala sugerido:*
    > *"Ótimo, [Nome]. Tenho informações suficientes para desenhar um escopo inicial. Para que possamos enviar a proposta técnica e financeira precisa, vocês poderiam nos enviar o link do repositório privado do GitHub (concedendo acesso de leitura para nossa equipe de engenharia) e o commit hash congelado? Feito isso, estimamos as linhas de código e enviamos a proposta em até 48 horas."*

---

## Resumo dos Critérios de Qualificação Comercial
*   **Fit Técnico Alto:** Projetos com testes unitários (suite Foundry rodando), documentação de arquitetura detalhada e commit hash congelado.
*   **Fit Técnico Baixo:** Código em desenvolvimento contínuo (sem code freeze), sem documentação explicativa e sem suite de testes locais rodando.
