# DAO Security Checklist

## Governance
- [ ] Quorum is high enough to prevent takeover
- [ ] Proposal threshold prevents spam
- [ ] Snapshot for voting power (no flash loan voting)
- [ ] Timelock on execution (2+ days)
- [ ] Vote delegation
- [ ] Voting period reasonable

## Treasury
- [ ] Multi-sig for large withdrawals
- [ ] Spending limits per proposal
- [ ] Emergency pause for treasury
- [ ] Transparent tracking

## Proposals
- [ ] Proposal validation before voting
- [ ] Cancel mechanism for malicious proposals
- [ ] Execution queue with delays
- [ ] Guardian role for emergency veto

## Upgrades
- [ ] Timelock on contract upgrades
- [ ] Proxy admin access controlled
- [ ] Upgrade proposals need community vote
- [ ] State migration tested
