# Guia Público de Segurança Web3 — Checklist de Pré-Lançamento
*Um checklist de mitigação de riscos para novos protocolos, emissores de tokens e startups Web3.*

---

## 1. Antes de Lançar um Token (ERC20 / ERC777 / Custom)
- [ ] **Cap de Emissão Máxima (Supply Cap):** Existe um limite rígido para a quantidade de moedas que podem ser emitidas? O método `mint` está restrito apenas a funções administrativas autorizadas?
- [ ] **Segurança de Transferência:** As chamadas de transferência verificam o valor de retorno? Considerou o uso de `SafeERC20` para compatibilidade com tokens que não retornam booleanos?
- [ ] **Privilégios Administrativos:** O criador do token (deployer) possui chaves para congelar contas ou confiscar fundos? Isso está explicitado na documentação do projeto?

## 2. Antes de Lançar um AMM / DEX
- [ ] **Proteção de Slippage:** As rotas de swap possuem parâmetros de saída mínimos (`amountOutMin`) obrigatórios configurados no frontend e verificados nos contratos?
- [ ] **Oráculos Robustos:** A taxa de conversão de ativos utiliza feeds protegidos contra manipulação rápida de preços por flash loans (ex: Chainlink ou TWAP)?
- [ ] **Cálculos Aritméticos:** Fórmulas de divisão e multiplicação tratam perdas por arredondamento para evitar drenagem de micropagamentos por bots?

## 3. Antes de Lançar uma Coleção NFT (ERC721 / ERC1155)
- [ ] **Aleatoriedade Justa (Bad Randomness):** A geração de raridades do NFT utiliza fontes seguras e imutáveis on-chain (como Chainlink VRF) em vez de variáveis previsíveis como `block.timestamp` ou `block.difficulty`?
- [ ] **Limite de Emissões por Usuário:** Há travas para impedir que um único endereço mine toda a coleção em uma única transação utilizando contratos atacantes?
- [ ] **Congelamento de Metadados:** Existe uma rota clara para tornar os metadados da coleção imutáveis (congelados no IPFS) após a revelação para garantir a integridade dos itens?

## 4. Antes de Lançar uma Ponte (Bridge) Cross-Chain
- [ ] **Controle de Nonces e Replay:** O contrato rastreia transações já processadas usando mapeamentos de assinaturas ativas para evitar saques em dobro da mesma mensagem?
- [ ] **Domínio da Assinatura (EIP-712):** As assinaturas incluem o ID da rede (Chain ID) e o endereço do contrato da ponte para evitar reuso em testnets ou redes paralelas?
- [ ] **Multisig de Validadores:** O saque de fundos exige a aprovação conjunta de múltiplos validadores independentes (Threshold M-of-N) em vez de uma assinatura única?

## 5. Antes de Abrir Captação de Recursos (VCs / Launchpads)
- [ ] **Auditoria Independente Realizada:** O repositório final de código passou por revisão manual profunda de terceiros com relatório emitido?
- [ ] **Documentação Técnica Completa:** A arquitetura lógica dos contratos e o fluxo de fundos estão descritos de forma simples para os analistas de risco dos fundos?
- [ ] **Pausabilidade Operacional:** Existem funções de pausa emergencial no contrato principal de depósitos prontas para serem acionadas em caso de anomalias detectadas?

## 6. Antes de Listar em Exchanges e Captar Liquidez
- [ ] **Timelocks Administrativos:** As chaves de controle da liquidez estão sob a proteção de um contrato de atraso temporal (timelock) para evitar puxadas de tapete (rug pulls)?
- [ ] **Multisig de Gestão de Tesouraria:** Os fundos da equipe e a liquidez inicial estão guardados em carteiras multi-assinadas com custódia distribuída?
- [ ] **Plano de Resposta a Incidentes:** Há um canal de emergência estabelecido entre os desenvolvedores principais para mitigação imediata de hacks ativos?
