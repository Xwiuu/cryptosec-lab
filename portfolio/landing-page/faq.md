# FAQ (Perguntas Frequentes) — Web3 Security Services

Este documento reúne as principais perguntas e respostas (FAQ) técnicas e comerciais utilizadas para quebrar objeções e estabelecer transparência sobre os limites de escopo e responsabilidade.

---

## 1. Uma auditoria garante que o protocolo não será hackeado?
> **Não.** Nenhuma auditoria de segurança garante imunidade absoluta contra ataques. A segurança em ecossistemas de contratos inteligentes é um processo dinâmico. A auditoria funciona identificando e mitigando vulnerabilidades lógicas conhecidas de código e reduzindo de forma expressiva a superfície de ataque on-chain. Contudo, novos vetores de exploração na máquina virtual, falhas em dependências externas ou de governança podem surgir pós-auditoria.

---

## 2. O uso de scanners heurísticos automáticos substitui a revisão manual?
> **Não.** Scanners automatizados (inclusive as heurísticas locais do nosso simulador) são excelentes ferramentas para triagem inicial e eliminação de bugs sintáticos óbvios. Entretanto, eles não possuem a capacidade intelectual de compreender a lógica de negócios customizada de um AMM ou as regras financeiras complexas de um pool de empréstimo. Apenas a revisão manual aprofundada por engenheiros seniores é capaz de capturar falhas complexas de design e inconsistências lógicas de mercado.

---

## 3. O CryptoSec Simulator utiliza fundos reais ou interage com a mainnet?
> **Não.** O simulador é um ambiente educacional e de testes isolado que opera por meio de redes de blocos e máquinas virtuais locais simuladas. Ele serve exclusivamente para demonstrar visualmente o fluxo de explorações e validação de defesas sem envolver fundos reais ou chaves privadas públicas.

---

## 4. Vocês conectam na rede principal (mainnet) para rodar os testes?
> **Não durante a análise técnica.** Todos os testes, simulações de reentrância e ataques de oráculo são executados em bifurcações locais (local forks) de testnets ou em ambientes sandbox locais de desenvolvimento (via Foundry). Isso garante total isolamento, velocidade de teste e segurança para o código do cliente.

---

## 5. Quanto tempo demora um processo de revisão de segurança completo?
> O prazo varia de acordo com o tamanho do repositório medido em nLoC (Normalized Lines of Code) e a complexidade técnica dos contratos. Em média, um **Starter Review** leva de 1 a 2 semanas, enquanto auditorias de ecossistemas complexos de DeFi ou Bridges exigem de 4 a 6 semanas de dedicação exclusiva.

---

## 6. O que a minha equipe precisa fornecer para iniciar a auditoria?
> Necessitamos de:
> 1.  O link de acesso de leitura ao repositório privado ou público do GitHub.
> 2.  O commit hash exato correspondente ao congelamento de escopo (code freeze).
> 3.  Documentação de arquitetura detalhada (como um ReadMe explicativo ou whitepaper técnico).
> 4.  A suite de testes unitários local rodando com sucesso.

---

## 7. A rodada de reteste está inclusa na proposta?
> **Sim.** Todas as nossas propostas padrão incluem 1 (uma) rodada de reteste sem custos adicionais, desde que as mitigações propostas sejam submetidas para validação em um commit específico em até 10 dias após a entrega do relatório preliminar (Draft Report).

---

## 8. Vocês mesmos aplicam as correções no repositório de produção do cliente?
> **Não.** Para garantir a independência da auditoria e evitar conflitos de interesse de desenvolvimento, nós não escrevemos diretamente no repositório de produção do cliente. Nós entregamos Pull Requests com propostas lógicas de alteração e revisamos os patches implementados pela equipe de engenharia do próprio cliente durante a fase de reteste.

---

## 9. Vocês realizam análise de integridade da Tokenomics (design de incentivos)?
> **Sim, sob escopo específico.** Realizamos revisões lógicas de vesting, distribuição de recompensas e regras de governança contra manipulação de votos. Contudo, ressaltamos que nossa análise é estritamente de segurança operacional de código e lógica computacional, não cobrindo consultoria de atratividade comercial de mercado ou valor de investimento financeiro de tokens.

---

## 10. Vocês realizam revisões lógicas de pontes (bridges) cross-chain?
> **Sim.** Avaliamos a segurança lógica de contratos de bloqueio/emissão (lock/mint), validação criptográfica de assinaturas multisig off-chain de validadores de pontes e defesas contra replay attacks de mensagens cross-chain.

---

## 11. Vocês assinam acordos de confidencialidade (NDA) antes de analisar o código?
> **Sim.** Todo o nosso processo de auditoria de contratos inteligentes em repositórios privados corre sob acordos de confidencialidade (NDA) rigorosos. Os relatórios técnicos preliminares nunca são divulgados publicamente sem autorização expressa e escrita do cliente.

---

## 12. O que fica expressamente fora do escopo de uma auditoria comum?
> Ficam fora do escopo comum: revisões de código de interfaces web (frontend) contra phishing tradicional, segurança da infraestrutura de servidores físicos da equipe do cliente, ataques de engenharia social a funcionários e vulnerabilidades em pacotes e bibliotecas de terceiros externas que não foram modificadas.
