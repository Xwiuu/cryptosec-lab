# DeFi Protocol Security Checklist

## Oracle
- [ ] Multiple independent oracle sources
- [ ] TWAP or median pricing (not spot)
- [ ] Heartbeat / stale price check
- [ ] Max deviation / circuit breaker
- [ ] Flash loan resistance
- [ ] Trusted updater with access control

## Lending
- [ ] Max LTV conservative (<= 75%)
- [ ] Health factor calculation verified
- [ ] Min health factor >= 1.5
- [ ] Liquidation threshold appropriate
- [ ] Close factor (max 50%)
- [ ] Liquidation bonus (5-15%)
- [ ] Oracle staleness check in liquidations
- [ ] Collateral factor per asset
- [ ] Borrow limits per user
- [ ] No undercollateralized borrowing

## AMM / DEX
- [ ] x*y=k formula verified
- [ ] Slippage protection (amountOutMin)
- [ ] Deadline for swaps
- [ ] Fee calculation correct (997/1000)
- [ ] LP token math verified
- [ ] Minimum liquidity burned
- [ ] TWAP for price oracle usage
- [ ] Reserve update consistency
- [ ] No donation attack surface
- [ ] Events for all operations

## Stablecoin
- [ ] Minimum collateral ratio (>= 150%)
- [ ] Supply cap
- [ ] Circuit breaker for price drops
- [ ] Redemption mechanism working
- [ ] Arbitrage incentives aligned
- [ ] No algorithmic death spiral
- [ ] Oracle manipulation resistant

## Bridge
- [ ] Chain ID in message hash
- [ ] Domain separator (EIP-712)
- [ ] Nonce per message
- [ ] Replay protection (processed messages)
- [ ] Multisig validator threshold
- [ ] Validator set management
- [ ] Rate limits per period
- [ ] Emergency pause
- [ ] Custody risk assessment
- [ ] Upgrade governance

## Yield Farm
- [ ] accRewardPerShare / reward debt pattern
- [ ] Pool update before stake/withdraw
- [ ] Reward rate change timelock
- [ ] Max stake limit
- [ ] Emergency withdraw function
- [ ] No same-block reward exploit
- [ ] Reward inflation sustainable

## Flash Loan
- [ ] TWAP not manipulable by flash loan
- [ ] Balance checks atomic
- [ ] Fee enforced
- [ ] Callback restrictions
- [ ] No governance flash loan attacks

## General
- [ ] Emergency pause mechanism
- [ ] Timelock on sensitive parameters
- [ ] Multisig for admin
- [ ] Events for all state changes
- [ ] Zero address checks
- [ ] Input validation
- [ ] Reentrancy protection
- [ ] Test coverage
- [ ] Economic attack surface analyzed
- [ ] Bug bounty program
