# Checklist Interno de Pré-Lançamento (Internal Pre-Launch Checklist)

Este checklist reúne os procedimentos técnicos e operacionais de segurança obrigatórios que devem ser validados pela equipe técnica do protocolo antes de realizar o deploy dos contratos na mainnet.

---

## 1. Congelamento de Código (Code Freeze)
- [ ] **Congelamento de Escopo:** Nenhuma linha de código foi adicionada ou modificada após o término da rodada final de auditoria.
- [ ] **Rastreabilidade de Commit:** O hash do commit que será publicado em produção é idêntico ao commit hash auditado no relatório final de reteste.

## 2. Testes de Cobertura e Integração
- [ ] **Suite de Testes Unitários:** Todos os testes automáticos (Foundry/Hardhat) estão com status verde (passando localmente).
- [ ] **Testes de Integração com Redes de Teste (Testnet):** As interações com contratos de terceiros (como Uniswap, Chainlink) foram testadas em redes de teste e simularam comportamentos normais.
- [ ] **Zero Warnings de Compilação:** O compilador Solidity finaliza sem emitir avisos ou alertas não analisados.

## 3. Auditoria Externa e Revisão Manual
- [ ] **Relatório de Auditoria Consolidado:** O relatório preliminar foi recebido e todas as falhas Críticas e Altas foram resolvidas.
- [ ] **Revisão Independente Finalizada:** As mitigações propostas foram revisadas por terceiros e validadas em reteste formal.

## 4. Governança e Controle Multisig
- [ ] **Custódia Distribuída:** As carteiras com privilégios de controle administrativo (owner) são carteiras multi-assinadas (multisig) de alta redundância.
- [ ] **Limiares de Assinatura (Threshold):** Configurado o quórum mínimo necessário de assinaturas (ex: 3 de 5) e as chaves privadas dos membros estão armazenadas em carteiras físicas de hardware separadas.

## 5. Ativação de Timelocks
- [ ] **Atraso de Mudanças Lógicas:** Configurado um contrato de Timelock intermediando as chamadas administrativas críticas, estabelecendo uma janela mínima de 48 horas de aviso antes de qualquer alteração de parâmetros ou atualizações lógicas de código (upgrades).

## 6. Configuração Correta de Oráculos
- [ ] **Endereços de Produção:** Os endereços dos contratos de feeds de preços apontam para os feeds oficiais da rede principal (mainnet) e não para contratos mock ou de teste.
- [ ] **Validação de Atualização:** Implementada proteção de expiração de preço (stale price check) para suspender operações se o oráculo parar de publicar atualizações.

## 7. Pausabilidade de Emergência (Emergency Pause)
- [ ] **Configuração de Pausa:** Funções de saque ou depósitos possuem modificador `whenNotPaused` ativo.
- [ ] **Papeis de Operadores de Emergência (Pauser):** O privilégio de pausar está atribuído a uma conta dedicada de baixo quórum (para resposta rápida a hacks ativos), enquanto a função de despausar (unpause) exige o quórum completo do timelock multisig.

## 8. Monitoramento e Alertas Ativos
- [ ] **Integração de Sentinelas:** Configuração de monitoramento de eventos on-chain via bots (ex: Forta) para detectar picos atípicos de retiradas ou chamadas incomuns às funções de upgrade.
- [ ] **Painéis de Diagnóstico:** Configuração de leituras de balanço de contratos inteligentes em tempo real integradas a painéis de status da equipe.

## 9. Plano de Resposta a Incidentes (War Room)
- [ ] **Plano de Comunicação de Crise:** Elaborado o roteiro interno contendo quem notificar, quais canais pausar e quais comunicados públicos emitir em caso de comprometimento do protocolo.
- [ ] **Acessos de Emergência Mapeados:** Todos os operadores de chaves administrativas possuem meios ágeis de contato direto em caso de war room.

## 10. Programa de Bug Bounty Ativo
- [ ] **Configuração de Termos:** Parcerias com plataformas como Immunefi ou publicação clara dos termos de recompensa no GitHub do projeto para atrair caçadores de bugs de forma responsável.

## 11. Comunicação Pública de Segurança
- [ ] **Divulgação do Relatório de Auditoria:** Publicação do link do PDF ou relatório de segurança no site oficial do projeto para demonstrar transparência aos usuários.
- [ ] **Documentação de Vetores de Risco:** Atualização do FAQ público explicando de forma simples quais são os mecanismos de pausa emergencial e o controle de chaves do projeto.
