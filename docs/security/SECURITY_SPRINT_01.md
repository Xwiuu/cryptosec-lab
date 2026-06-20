# CryptoSec Lab — Security Sprint 01

## Sprint Goal

Prepare CryptoSec Lab for public release by validating repository hygiene, supply-chain security, frontend safety, Rust/Foundry correctness and educational vulnerability isolation.

## Sprint Scope

- GitHub Security setup
- Kali local pentest
- Gitleaks triage
- Trivy dependency review
- npm audit
- Rust cargo/clippy/tests
- Foundry build/tests
- ZAP baseline
- Retest report
- GitHub release v0.1.0

## Sprint Board Columns

- Backlog
- Ready
- In Progress
- Retest
- Done
- Accepted Risk
- Educational Only

## Issues to Create

### SEC-001 — Triage Gitleaks Findings

Labels: security, secrets, needs-triage  
Severity: Needs Triage

Checklist:

- [ ] Inspect Gitleaks JSON report
- [ ] Classify each finding
- [ ] Confirm real secret or false positive
- [ ] Add `.gitleaks.toml` allowlist if needed
- [ ] Rotate any real exposed secret
- [ ] Retest Gitleaks

### SEC-002 — Fix DOMPurify Supply-Chain Finding

Labels: security, frontend, dependency  
Severity: Medium

Checklist:

- [ ] Run `npm why dompurify`
- [ ] Run `npm audit fix`
- [ ] Add override if needed
- [ ] Reinstall dependencies
- [ ] Run `npm audit --omit=dev`
- [ ] Run lint/typecheck/build

### SEC-003 — Complete Kali Toolchain Setup

Labels: security, kali, environment  
Severity: Informational

Checklist:

- [ ] Validate Node
- [ ] Validate npm
- [ ] Validate Rust
- [ ] Validate Cargo
- [ ] Validate Foundry
- [ ] Validate ZAP

### SEC-004 — Run Full Rust Validation

Labels: rust, security, ci

Checklist:

- [ ] `cargo fmt --all --check`
- [ ] `cargo clippy --all-targets -- -D warnings`
- [ ] `cargo test --workspace`

### SEC-005 — Run Full Foundry Validation

Labels: solidity, foundry, security

Checklist:

- [ ] `forge fmt --check`
- [ ] `forge build`
- [ ] `forge test -vvv`
- [ ] Confirm vulnerable/secure pairs

### SEC-006 — Run Frontend Security Validation

Labels: frontend, admin, security

Checklist:

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Check dangerous frontend patterns
- [ ] Check admin demo warnings
- [ ] Check no real wallet or mainnet connection

### SEC-007 — Run ZAP Baseline

Labels: zap, dast, frontend

Checklist:

- [ ] Start frontend locally
- [ ] Run ZAP baseline
- [ ] Triage High/Medium alerts
- [ ] Document false positives
- [ ] Retest

### SEC-008 — Publish v0.1.0 Release

Labels: release, documentation

Checklist:

- [ ] Pentest report created
- [ ] Retest report created
- [ ] Vulnerability register updated
- [ ] GitHub Security features enabled
- [ ] Release notes created
- [ ] Tag `v0.1.0`
- [ ] GitHub release published
