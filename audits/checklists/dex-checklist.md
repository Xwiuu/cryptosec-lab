# DEX / AMM Security Checklist

## Core Math
- [ ] Constant product formula x*y=k
- [ ] No overflow/underflow in calculations
- [ ] Fee deduction correct (997/1000)
- [ ] getAmountOut rounds in favor of pool
- [ ] getAmountIn rounds in favor of pool
- [ ] Minimum liquidity check

## Slippage Protection
- [ ] amountOutMin parameter on swap
- [ ] amountMin parameters on removeLiquidity
- [ ] minShares on addLiquidity
- [ ] Deadline parameter on swap
- [ ] Deadline enforced (block.timestamp check)

## Liquidity
- [ ] LP mint/burn proportional to reserves
- [ ] MINIMUM_LIQUIDITY burned to first LP
- [ ] Total liquidity tracking
- [ ] Liquidity cannot be drained
- [ ] No donation to manipulate LP shares

## Price Oracle
- [ ] Spot price not used directly by protocols
- [ ] TWAP implemented for oracle consumers
- [ ] Cumulative price updated correctly
- [ ] No stale price usage

## Security
- [ ] Zero address checks
- [ ] Identical token check
- [ ] Reserve update after every operation
- [ ] Events for add/remove/swap
- [ ] Reentrancy protection (CEI pattern)
- [ ] No flash loan manipulation of reserves
- [ ] Sandwich attack mitigation
- [ ] Front-running mitigation

## Governance / Admin
- [ ] Fee rate change timelock
- [ ] Protocol fee withdrawal access control
- [ ] No unauthorized reserve manipulation
- [ ] Emergency pause if needed
