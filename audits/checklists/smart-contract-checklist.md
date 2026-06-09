# Smart Contract Security Checklist

## Access Control
- [ ] Existem funcoes administrativas?
- [ ] Todas usam onlyOwner / onlyRole?
- [ ] Owner e EOA, multisig ou DAO?
- [ ] Existe timelock em operacoes sensiveis?
- [ ] Existe processo de renuncia ou transferencia de ownership?
- [ ] Roles sao revogaveis?

## Reentrancy
- [ ] Existem external calls (call, transfer, send)?
- [ ] Estado e atualizado ANTES da chamada externa? (checks-effects-interactions)
- [ ] Usa ReentrancyGuard / lock?
- [ ] Existe cross-function reentrancy?
- [ ] Todas as funcoes que fazem external call estao protegidas?

## Oracle / Price Feeds
- [ ] Fonte do preco e confiavel?
- [ ] Existe heartbeat / stale price check?
- [ ] Existe limite de variacao (deviation)?
- [ ] Usa TWAP / mediana / multiplas fontes?
- [ ] Preco pode ser manipulado por flash loan?
- [ ] Single point of failure no oracle?

## Token / ERC20
- [ ] Existe supply cap?
- [ ] Quem pode mintar?
- [ ] Quem pode pausar? (Se pausavel)
- [ ] Existe blacklist?
- [ ] Existem taxas ocultas?
- [ ] Existem permissoes abusivas (infinite approve)?
- [ ] Eventos Transfer e Approval emitidos corretamente?

## DEX / AMM
- [ ] Slippage e obrigatorio (minAmountOut)?
- [ ] Deadline e obrigatorio?
- [ ] Formula AMM esta correta (x*y=k)?
- [ ] Reserves sao atualizadas corretamente?
- [ ] Existe risco de sandwich / front-running?
- [ ] Liquidity pools tem protecao contra manipulacao?

## DAO / Governance
- [ ] Quorum e suficiente para evitar ataque?
- [ ] Usa snapshot de votos?
- [ ] Existe timelock entre aprovacao e execucao?
- [ ] Proposal threshold evita spam?
- [ ] Treasury e protegida?
- [ ] Voto baseado em saldo atual (manipulavel)?

## NFT / ERC721
- [ ] Metadata pode mudar apos mint?
- [ ] Existe freeze mechanism?
- [ ] Supply cap definido?
- [ ] Mint tem access control?
- [ ] Marketplace valida assinatura / ordem?
- [ ] TokenURI e mutavel sem restricao?

## Upgradeability
- [ ] initialize() e protegido contra front-running?
- [ ] upgradeTo() tem access control?
- [ ] Existe timelock / delay?
- [ ] Storage layout e preservado entre versoes?
- [ ] Admin pode trocar implementacao arbitrariamente?
- [ ] Existe funcao de cancelamento?
- [ ] Eventos de upgrade emitidos?

## Randomness
- [ ] Usa block.timestamp / blockhash / block.number?
- [ ] Existe commit-reveal?
- [ ] Usa VRF / oracle externo?
- [ ] Atacante pode prever o resultado?
- [ ] Minerador pode influenciar?

## Approval / Allowance
- [ ] Usa approve com valor infinito?
- [ ] Existe funcao revoke?
- [ ] Allowance reduzida apos cada transferFrom?
- [ ] Limite por usuario / operacao?
- [ ] Suporta EIP-2612 (permit)?

## Flash Loan
- [ ] Snapshot usado em votacao?
- [ ] Preco usa TWAP?
- [ ] Limite de manipulacao por transacao?
- [ ] Oracles resistem a manipulacao por flash loan?

## General
- [ ] Eventos emitidos para todas as mudancas de estado?
- [ ] Parametros sensiveis nao vazam em eventos?
- [ ] Pause mechanism para emergencia?
- [ ] Emergency withdraw para usuarios?
- [ ] Circuit breaker para desvios de preco?
- [ ] Testes de unidade e integracao?
- [ ] Testes de ataque / exploit?
- [ ] Contratos marcados como vulneraveis?
- [ ] Documentacao de riscos?
