# DeFi Lab - CryptoSec Lab

## Objetivo
Laboratorio educacional de seguranca DeFi com AMM, Lending, Stablecoin, Oracle, Flash Loan, Bridge, Yield Farming e ataques economicos.

## Aviso Etico
**ESTE MATERIAL E ESTRITAMENTE EDUCACIONAL.** Nao use em producao, mainnet, testnets publicas ou contratos reais.

## Modulos

| Modulo | Contrato Vulneravel | Contrato Seguro | Atacante | Teste |
|--------|--------------------|-----------------|----------|-------|
| AMM Price Manipulation | VulnerableAMM | SecureAMM | PriceManipulationAttacker | AMMPriceManipulation.t.sol |
| Sandwich / MEV | VulnerableAMM | SecureAMM | SandwichAttacker | SandwichAttack.t.sol |
| Flash Loan Oracle | VulnerableFlashLoanPool / VulnerablePriceOracle | SecureFlashLoanPool / SecurePriceOracle | FlashLoanOracleAttacker | FlashLoanOracleAttack.t.sol |
| Lending Pool Drain | VulnerableLendingPool / VulnerablePriceOracle | SecureLendingPool / SecurePriceOracle | LendingDrainAttacker | LendingPoolAttack.t.sol |
| Liquidation Attack | VulnerableLiquidationEngine | SecureLiquidationEngine | LiquidationAttacker | LiquidationAttack.t.sol |
| Stablecoin Depeg | VulnerableStablecoin / VulnerablePriceOracle | SecureStablecoin / SecurePriceOracle | StablecoinDepegAttacker | StablecoinDepeg.t.sol |
| Bridge Replay | VulnerableBridge | SecureBridge | BridgeReplayAttacker | BridgeReplayAttack.t.sol |
| Bridge Validator Compromise | VulnerableBridge | SecureBridge | BridgeValidatorCompromiseAttacker | BridgeValidatorCompromise.t.sol |
| Liquidity Rug Pull | VulnerableAMM | - | LiquidityRugPullAttacker | LiquidityRugPull.t.sol |
| Impermanent Loss | - | - | - | ImpermanentLossSimulation.t.sol |
| Yield Farm Risk | VulnerableYieldFarm | SecureYieldFarm | - | - |

## Como Rodar

```bash
cd contracts
forge build
forge test -vvv
forge test --match-path test/defi/* -vvv
```

## Ordem Recomendada de Estudo

1. **AMM** - Conceitos basicos de DEX (defi-lab/concepts/amm.md)
2. **Slippage Protection** - Por que e importante (SecureAMM)
3. **Sandwich Attack** - MEV na pratica (SandwichAttack.t.sol)
4. **Price Oracle** - Tipos e riscos (oracle.md)
5. **Flash Loan + Oracle Attack** - Ataque combinado (FlashLoanOracleAttack.t.sol)
6. **Lending Protocol** - Colateral, LTV, health factor (lending.md)
7. **Liquidation Exploit** - Liquidacao indevida (LiquidationAttack.t.sol)
8. **Stablecoin** - Overcollateralization e depeg (stablecoin.md)
9. **Bridge Security** - Replay e validator compromise (bridge.md)
10. **Impermanent Loss** - Risco de LP (impermanent-loss.md)
11. **Yield Farm** - Reward accounting (yield-farm-risk.md)

## Ataques Implementados

Ver `exploits/defi/` para documentacao detalhada de cada ataque.

## Estrutura

```
defi-lab/
  README.md
  concepts/       - Documentacao de conceitos
  simulations/    - Simulacoes de ataques
contracts/src/defi/
  vulnerable/     - Contratos vulneraveis
  secure/         - Contratos seguros
  attacks/        - Contratos de ataque
contracts/test/defi/
  *.t.sol         - Testes Foundry
exploits/defi/    - Documentacao de exploits
```
