# Definição de Escopo — CryptoSec Lab

**Projeto:** [Nome do Projeto]
**Cliente:** [Nome do Cliente]
**Data de Início:** [Data]
**Data de Entrega Prevista:** [Data]

---

## 1. Resumo do Engajamento

| Campo | Detalhe |
|-------|---------|
| **Tipo de Auditoria** | [ ] Protocol [ ] Smart Contract [ ] DeFi [ ] Wallet [ ] Exchange [ ] Bridge [ ] OpSec |
| **Engenheiro Líder** | |
| **Engenheiros Designados** | |
| **Carga Horária Estimada** | [N] horas |
| **Custo Total** | [Valor] |
| **Moeda de Pagamento** | [USDC / ETH / USD / Outro] |

---

## 2. Escopo — In Scope

### Repositórios e Commits

| Repositório | Branch | Commit Hash | Data |
|-------------|--------|-------------|------|
| [URL do repo] | `[branch]` | `[commit_hash]` | [data] |
| [URL do repo] | `[branch]` | `[commit_hash]` | [data] |

### Contratos Inteligentes

| Contrato | Arquivo | SLOC | Versão do Compilador | Endereço (se deployado) | Rede |
|----------|---------|------|----------------------|--------------------------|------|
| [Nome] | `path/file.sol` | [N] | [v0.8.x] | `0x...` | [Rede] |
| [Nome] | `path/file.sol` | [N] | [v0.8.x] | `0x...` | [Rede] |

### Componentes Off-Chain (se aplicável)

- [ ] Bot de liquidação: [descrição]
- [ ] Indexer / Subgraph: [descrição]
- [ ] Script de keeper: [descrição]
- [ ] Backend / API: [descrição]
- [ ] Frontend (somente transações): [descrição]

### Testes

- [ ] Testes unitários serão revisados
- [ ] Ferramenta: [Foundry / Hardhat / Truffle / Outro]
- [ ] Cobertura mínima esperada: [N]%

---

## 3. Escopo — Out of Scope

Os itens abaixo estão **explicitamente fora do escopo** desta auditoria e não serão analisados:

- [ ] Contratos implantados em versões anteriores (não auditadas)
- [ ] Frontend completo (UX, privacidade do usuário)
- [ ] Infraestrutura de servidores (devOps, cloud security)
- [ ] Rede blockchain subjacente (consenso, segurança L1)
- [ ] Dependências de terceiros não modificadas (OpenZeppelin, etc.)
- [ ] Testes de penetração em ambiente de produção
- [ ] Análise de tokenomics (token distribution, vesting schedules)
- [ ] Compliance regulatório (KYC/AML, securities law)
- [ ] Segurança de carteiras de usuário final
- [ ] Código não commitado no hash especificado
- [ ] [Outros itens conforme acordado]

> **Nota:** Itens fora de escopo podem ser cobertos em um engajamento separado. Contate-nos para um orçamento personalizado.

---

## 4. Rede e Chain

| Campo | Detalhe |
|-------|---------|
| **Rede Principal (Mainnet)** | [Ethereum / BNB Chain / Polygon / etc.] |
| **Chain ID** | [1 / 56 / 137 / etc.] |
| **Rede de Teste (Testnet)** | [Goerli / Sepolia / etc.] |
| **L2 / Sidechain (se aplicável)** | [Optimism / Arbitrum / Base / etc.] |
| **Explorador de Blocos** | [URL do block explorer] |

---

## 5. Modelo de Papéis (Roles)

| Role | Descrição | Privilégios | Entidade Controladora |
|------|-----------|-------------|----------------------|
| **Admin** | Administrador do sistema | Upgrade, pause, parâmetros | [Equipe / Multisig / DAO] |
| **Owner** | Dono do contrato | Ownable padrão | [Endereço / Multisig] |
| **Guardian** | Segurança | Pause emergencial | [Endereço] |
| **User** | Usuário final | Depósito, saque, swap | Qualquer endereço |
| **Liquidity Provider** | Provedor de liquidez | Add/remove liquidity | Qualquer endereço |
| **Bot** | Keeper / liquidator | Liquidações, rebalanceamento | [Endereço whitelisted] |
| **Treasury** | Tesouro do protocolo | Recebimento de taxas | [Multisig / DAO] |

---

## 6. Premissas (Assumptions)

As seguintes premissas são adotadas nesta auditoria. Se qualquer premissa se mostrar incorreta, a avaliação de risco pode ser afetada.

1. **Oráculos:** Assume-se que os oráculos de preço (Chainlink, TWAP) retornam preços corretos e atualizados em condições normais de mercado. Ataques a oráculos por comprometimento do próprio oráculo (não do contrato) estão fora de escopo.
2. **Rede Blockchain:** Assume-se que a camada de consenso da blockchain subjacente é segura (nenhum ataque de 51% ou reorganização profunda).
3. **Dependências:** Assume-se que as bibliotecas externas (OpenZeppelin, etc.) não contêm vulnerabilidades nas versões especificadas.
4. **Chaves Privadas:** Assume-se que as chaves privadas de administradores e signatários multisig são armazenadas com segurança adequada.
5. **Implantações:** Assume-se que os scripts de deploy produzem o mesmo bytecode que o código-fonte auditado (verificação de correspondência).
6. **Não-Maliciosidade:** Assume-se que a equipe do projeto não insere intencionalmente backdoors no código auditado.

---

## 7. Restrições (Constraints)

1. **Prazo:** O relatório final deve ser entregue em até [N] dias úteis da data de início.
2. **Retestes:** Até [N] rodadas de reteste estão incluídas no escopo. Rodadas adicionais serão cobradas separadamente.
3. **Acesso:** O cliente deve fornecer acesso ao repositório privado, documentação e qualquer ambiente necessário (testnet, fork) até [data limite].
4. **Congelamento de Código:** Nenhuma alteração no código pode ser feita durante o período de auditoria sem comunicação prévia e aprovação da CryptoSec Lab.
5. **Disponibilidade:** O cliente deve disponibilizar pelo menos um desenvolvedor para esclarecimentos técnicos durante o horário comercial.

---

## 8. Entregáveis (Deliverables)

| Entregável | Formato | Prazo |
|------------|---------|-------|
| Questionário Pré-Auditoria Preenchido | PDF / Markdown | Antes do início |
| Relatório de Auditoria Completo | PDF + Markdown | Data de entrega |
| Planilha de Achados (Findings Spreadsheet) | CSV / Excel | Data de entrega |
| Relatório de Reteste (por rodada) | PDF + Markdown | 5 dias úteis após correção |
| Certificado de Auditoria (opcional) | PDF | Após aprovação final |

---

## 9. Cronograma

| Fase | Duração | Data Início | Data Fim | Responsável |
|------|---------|-------------|----------|-------------|
| Kickoff + Questionário | 2 dias | | | [Cliente + CryptoSec] |
| Revisão de Arquitetura | [N] dias | | | [CryptoSec] |
| Varredura Automatizada | [N] dias | | | [CryptoSec] |
| Revisão Manual | [N] dias | | | [CryptoSec] |
| Testes e Simulações | [N] dias | | | [CryptoSec] |
| Elaboração do Relatório | [N] dias | | | [CryptoSec] |
| Entrega do Relatório | — | | | [CryptoSec] |
| Reteste (por rodada) | [N] dias | | | [Cliente + CryptoSec] |

---

## 10. Aprovações

**CryptoSec Lab**

**Nome:** _________________________________
**Cargo:** [CTO / Engenheiro Líder]
**Data:** _________
**Assinatura:** _________________________________

**Cliente**

**Nome:** _________________________________
**Cargo:** [CTO / Founder / Lead Dev]
**Empresa / Projeto:** _________________________________
**Data:** _________
**Assinatura:** _________________________________

---

*Este documento constitui o acordo formal de escopo para o engajamento de auditoria. Alterações devem ser formalizadas via change request assinado por ambas as partes.*
