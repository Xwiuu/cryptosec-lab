# Operational Security Checklist

## Key Management

- [ ] Admin keys stored in hardware wallet (Ledger/Trezor)
- [ ] Multisig setup with >= 3 signers
- [ ] Signer geographic distribution
- [ ] No single person controls all signers
- [ ] Key rotation policy documented
- [ ] Backup seed phrases in secure offline storage
- [ ] No private keys in environment variables
- [ ] No private keys in CI/CD pipelines
- [ ] Key ceremony procedure documented

## Access Control

- [ ] GitHub repository access restricted
- [ ] Branch protection rules enforced
- [ ] Code review required for all PRs
- [ ] Two-factor authentication enforced for team
- [ ] Principle of least privilege applied
- [ ] Access reviews conducted quarterly
- [ ] Contractor/vendor access time-limited
- [ ] Audit log of access changes maintained

## CI/CD Security

- [ ] CI secrets encrypted and rotated regularly
- [ ] Dependency scanning (Dependabot/Snyk)
- [ ] Static analysis in CI pipeline
- [ ] Lint checks enforced
- [ ] Build reproducibility verified
- [ ] Deployment keys separate from dev keys
- [ ] Test suite runs on every PR
- [ ] No hardcoded addresses/keys in source

## Incident Response

- [ ] Incident response playbook documented
- [ ] Emergency contact list maintained
- [ ] Communication template prepared
- [ ] Monitoring and alerting configured
- [ ] On-call rotation established
- [ ] Post-mortem process documented
- [ ] Incident severity classification defined
- [ ] Regular tabletop exercises conducted

## Deploy Procedure

- [ ] Deploy scripts version-controlled
- [ ] Testnet deploy always precedes mainnet
- [ ] Contract verification (Etherscan) automated
- [ ] Proxy admin transfers documented
- [ ] Timelock delays respected
- [ ] Deployment checklist followed
- [ ] Multi-signer approval for mainnet deploy
- [ ] Emergency rollback procedure documented

## Monitoring

- [ ] On-chain transaction monitoring
- [ ] Large transfer alerts configured
- [ ] Oracle price deviation alerts
- [ ] New contract deployment alerts
- [ ] Abnormal gas usage alerts
- [ ] Dashboard for protocol health metrics
- [ ] Anomaly detection system active

## Communication Security

- [ ] Official communication channels verified
- [ ] Phishing awareness training for team
- [ ] Social engineering attack procedures
- [ ] Website/domain security (DNSSEC, HTTPs)
- [ ] Twitter/GitHub accounts with 2FA
- [ ] Discord/Telegram admin channels secured
- [ ] Impersonation account monitoring

## Vendor/Third-Party Security

- [ ] All dependencies audited or well-known
- [ ] Oracle providers assessed for reliability
- [ ] RPC providers have SLAs
- [ ] Infrastructure providers (AWS, etc.) secured
- [ ] Smart contract auditors independent
- [ ] Bug bounty platform selected
- [ ] Insurance providers vetted

## Compliance

- [ ] Jurisdiction legal review completed
- [ ] Token classification determined
- [ ] KYC/AML procedures if applicable
- [ ] Data privacy (GDPR) compliance
- [ ] Terms of service and privacy policy published
- [ ] Risk disclosures to users
- [ ] Regulatory reporting obligations identified

## Bug Bounty

- [ ] Bug bounty program active on Immunefi/HackerOne
- [ ] Clear scope and rewards published
- [ ] Response time SLA defined
- [ ] Vulnerability disclosure policy published
- [ ] Whitehat contact information public
- [ ] Retest process for reported vulnerabilities
- [ ] Payout process documented

## Insurance

- [ ] Smart contract cover obtained
- [ ] Custodian insurance if applicable
- [ ] Coverage amount proportional to TVL
- [ ] Policy renewal schedule tracked
- [ ] Claims process documented
- [ ] Insurance provider financially sound
