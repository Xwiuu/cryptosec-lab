# Smart Contracts - Vulneraveis e Seguros

Projeto Foundry com contratos Solidity vulneraveis e suas versoes corrigidas.

## Aviso Etico

**ESTE PROJETO E ESTRITAMENTE EDUCACIONAL.**

- Todo codigo vulneravel esta explicitamente marcado como `VULNERABLE: intentionally insecure for educational purposes.`
- Todos os ataques sao simulacoes locais controladas via Foundry
- Nao conectar mainnet, testnets publicas, carteiras reais ou contratos reais
- Nao usar chaves privadas reais
- O objetivo e aprender, auditar e corrigir vulnerabilidades

## Requisitos

- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Comandos

```bash
# Compilar
forge build

# Executar testes
forge test

# Executar testes com verbose
forge test -vvv

# Rodar anvil local
anvil

# Deploy local
forge script script/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# Verificar formato
forge fmt --check
```

## Contratos Vulneraveis

| Contrato | Vulnerabilidade |
|----------|----------------|
| VulnerableBank.sol | Reentrancy |
| VulnerableToken.sol | Unrestricted mint, approve abuse |
| VulnerableDEX.sol | No slippage, price manipulation |
| VulnerableNFT.sol | Infinite mint, mutable metadata |
| VulnerableDAO.sol | Flash loan governance, no timelock |
| VulnerableOracle.sol | Single source, no stale check |
| VulnerableLending.sol | Bad oracle, no health factor |
| VulnerableRandomness.sol | Predictable randomness (blockhash) |
| VulnerableApprovalVault.sol | Infinite approval abuse |
| VulnerableUpgradeable.sol | Unprotected initialize, public upgrade |

## Contratos Seguros

| Contrato | Mitigacao |
|----------|-----------|
| SecureBank.sol | Checks-Effects-Interactions, ReentrancyGuard |
| SecureToken.sol | Access control, supply cap, mint deadline |
| SecureDEX.sol | Slippage protection, LP tokens, fee mechanism |
| SecureNFT.sol | Supply cap, metadata freeze, access control |
| SecureDAO.sol | Snapshot, timelock, quorum, proposal threshold |
| SecureOracle.sol | Multiple sources, median, deviation check, stale check |
| SecureLending.sol | Health factor, liquidation, collateral factor |
| SecureRandomness.sol | Commit-reveal scheme |
| SecureApprovalVault.sol | Limited pull, revoke mechanism, operator control |
| SecureUpgradeable.sol | Protected initialize, timelock upgrade, cancel |

## Contratos Atacantes

| Contrato | Ataque |
|----------|--------|
| ReentrancyAttacker.sol | Reentrancy com fallback |
| OracleManipulator.sol | Oracle price manipulation |
| FlashLoanAttacker.sol | Flash loan simulation |
| GovernanceAttacker.sol | Governance takeover |
| ApprovalAbuseAttacker.sol | Infinite approve abuse |
| BadRandomnessAttacker.sol | Predictable randomness exploit |

## Testes de Ataque

| Teste | Ataque |
|-------|--------|
| ReentrancyAttack.t.sol | Reentrancy com fallback |
| AccessControlAttack.t.sol | Mint nao autorizado |
| OracleManipulation.t.sol | Manipulacao de preco |
| FlashLoanAttack.t.sol | Flash loan simulation |
| FrontRunningSimulation.t.sol | MEV / front-running / sandwich |
| BadRandomness.t.sol | Blockhash/timestamp previsivel |
| ApprovalAbuse.t.sol | Infinite approve abuse |
| GovernanceAttack.t.sol | Governance takeover |
| NFTMetadataAttack.t.sol | Metadata manipulavel |
| UpgradeabilityRisk.t.sol | Initialize takeover, upgrade abuse |
| SecureContracts.t.sol | Testes de mitigacao dos contratos seguros |

## Vulnerabilidades

| # | Vulnerabilidade | Contrato Vulneravel | Contrato Seguro | Teste |
|---|----------------|---------------------|-----------------|-------|
| 1 | Reentrancy | VulnerableBank.sol | SecureBank.sol | ReentrancyAttack.t.sol |
| 2 | Access Control | VulnerableToken.sol | SecureToken.sol | AccessControlAttack.t.sol |
| 3 | Oracle Manipulation | VulnerableOracle.sol, VulnerableLending.sol | SecureOracle.sol, SecureLending.sol | OracleManipulation.t.sol |
| 4 | Flash Loan | MockFlashLoanPool | - | FlashLoanAttack.t.sol |
| 5 | Front-Running / MEV | VulnerableDEX.sol | SecureDEX.sol | FrontRunningSimulation.t.sol |
| 6 | Bad Randomness | VulnerableRandomness.sol | SecureRandomness.sol | BadRandomness.t.sol |
| 7 | Approval Abuse | VulnerableToken.sol, VulnerableApprovalVault.sol | SecureApprovalVault.sol | ApprovalAbuse.t.sol |
| 8 | Governance Attack | VulnerableDAO.sol | SecureDAO.sol | GovernanceAttack.t.sol |
| 9 | NFT Metadata | VulnerableNFT.sol | SecureNFT.sol | NFTMetadataAttack.t.sol |
| 10 | Upgradeability Risk | VulnerableUpgradeable.sol | SecureUpgradeable.sol | UpgradeabilityRisk.t.sol |

## Ordem Recomendada de Estudo

1. **Reentrancy** - Ataque classico, essencial entender
2. **Access Control** - Base de seguranca em contratos
3. **Bad Randomness** - Erro comum em jogos/loterias
4. **Approval Abuse** - Risco de approve infinito
5. **Oracle Manipulation** - Ataque a precos
6. **Flash Loan** - Emprestimos instantaneos
7. **DEX/MEV/Sandwich** - Front-running em AMM
8. **NFT Metadata** - Integridade de metadados
9. **Governance** - Seguranca de DAOs
10. **Upgradeability** - Riscos de proxy/upgrade

## Notas de Seguranca

- Nao usar contratos vulneraveis em producao
- Nao conectar mainnet ou testnets publicas
- Nao usar chaves reais ou carteiras com fundos reais
- Todos os testes rodam localmente com Foundry/Anvil
- Ataques sao simulacoes controladas em ambiente isolado
- Documentacao completa em `exploits/smart-contracts/`

## Estrutura de Diretorios

```
contracts/
  foundry.toml
  README.md
  lib/forge-std/
  src/
    interfaces/           - Interfaces minimas (IERC20, IERC721, IPriceOracle, IDex)
    vulnerable/           - Contratos vulneraveis (intencionalmente inseguros)
    secure/               - Contratos seguros (com mitigacoes)
    attacks/              - Contratos atacantes para demonstracao
    defi/
      vulnerable/         - Contratos DeFi vulneraveis
      secure/             - Contratos DeFi seguros
      attacks/            - Contratos atacantes DeFi
  test/                   - Testes Foundry de ataque e mitigacao
    defi/                 - Testes DeFi
  script/                 - Scripts de deploy local
```

## Fase 4 - DeFi / DEX Security Lab

| Tema | Contrato Vulneravel | Contrato Seguro | Atacante | Teste | Documentacao |
|------|--------------------|-----------------|----------|-------|-------------|
| AMM Price Manipulation | VulnerableAMM.sol | SecureAMM.sol | PriceManipulationAttacker.sol | AMMPriceManipulation.t.sol | exploits/defi/amm-price-manipulation.md |
| Sanduiche/MEV | - | SecureAMM.sol | SandwichAttacker.sol | SandwichAttack.t.sol | exploits/defi/sandwich-attack.md |
| Flash Loan Oracle | VulnerableFlashLoanPool.sol + VulnerablePriceOracle.sol | SecureFlashLoanPool.sol + SecurePriceOracle.sol | FlashLoanOracleAttacker.sol | FlashLoanOracleAttack.t.sol | exploits/defi/flash-loan-oracle-attack.md |
| Lending Pool | VulnerableLendingPool.sol | SecureLendingPool.sol | LendingDrainAttacker.sol | LendingPoolAttack.t.sol | exploits/defi/lending-pool-drain.md |
| Liquidation | VulnerableLiquidationEngine.sol | SecureLiquidationEngine.sol | LiquidationAttacker.sol | LiquidationAttack.t.sol | exploits/defi/liquidation-attack.md |
| Stablecoin | VulnerableStablecoin.sol | SecureStablecoin.sol | StablecoinDepegAttacker.sol | StablecoinDepeg.t.sol | exploits/defi/stablecoin-depeg.md |
| Bridge Replay | VulnerableBridge.sol | SecureBridge.sol | BridgeReplayAttacker.sol | BridgeReplayAttack.t.sol | exploits/defi/bridge-replay-attack.md |
| Bridge Validator | VulnerableBridge.sol | SecureBridge.sol | BridgeValidatorCompromiseAttacker.sol | BridgeValidatorCompromise.t.sol | exploits/defi/bridge-validator-compromise.md |
| Rug Pull | VulnerableAMM.sol | - | LiquidityRugPullAttacker.sol | LiquidityRugPull.t.sol | exploits/defi/liquidity-rug-pull.md |
| Impermanent Loss | - | - | - | ImpermanentLossSimulation.t.sol | exploits/defi/impermanent-loss.md |
| Yield Farm | VulnerableYieldFarm.sol | SecureYieldFarm.sol | - | - | exploits/defi/yield-farm-risk.md |
