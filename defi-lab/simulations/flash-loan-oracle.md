# Simulação de Flash Loan Oracle Attack

## Contexto

Esta simulação combina flash loan, manipulação de oráculo AMM e um protocolo de lending vulnerável para drenar o pool de empréstimos em uma única transação. O cenário utiliza três contratos: `VulnerableFlashLoanPool.sol` (pool de flash loan com 1.000 ETH), `VulnerablePriceOracle.sol` (oráculo baseado em reserva spot) e `VulnerableLendingPool.sol` (pool de lending).

## Pré-condições

- Pool de flash loan com 1.000 ETH de liquidez.
- AMM com reservas rasas (50 ETH / 100.000 USDC).
- Protocolo de lending com 500.000 USDC no pool de empréstimos.
- Oráculo consulta `getReserves()` sem TWAP.

## Passo a Passo

1. O atacante (contrato `FlashLoanOracleAttacker`) solicita 500 ETH de flash loan.
2. Com 500 ETH, realiza swap na AMM — compra 90.909 USDC, esvaziando a reserva de USDC. A pool vai para (550 ETH, 9.091 USDC). O preço spot do USDC vai de 2.000 para ~0,0165 ETH por USDC (uma alteração drástica).
3. `VulnerablePriceOracle` consulta a pool e retorna o preço manipulado — USDC aparece supervalorizado (1 USDC ≈ 0,0165 ETH, ou seja, 1 ETH ≈ 60 USDC).
4. O atacante deposita o USDC que acabou de comprar (90.909 USDC) como colateral. O contrato avalia o colateral como valendo ~5.500 ETH (absurdo).
5. O atacante empresta 500 ETH do pool de lending (o máximo permitido pelo colateral inflado).
6. Devolve o flash loan de 500 ETH.
7. O atacante fica com os 90.909 USDC comprados inicialmente (que custaram 500 ETH, mas agora são lucro líquido de ~90.909 USDC).

## Impacto

O pool de lending perde 500.000 USDC (ou 500 ETH, dependendo do ativo emprestado) e fica com colateral sem valor (USDC de uma pool manipulada que retornará ao preço original). O atacante lucra ~$90.000.

## Mitigação

A simulação com `SecureAMM.sol` (TWAP de 1 hora) mostra que o preço retornado pela pool permanece próximo do real (~2.000 USDC/ETH), impedindo o depósito de colateral inflado. O ataque é revertido na primeira tentativa de emprestar.
