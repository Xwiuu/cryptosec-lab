# Issues to Create

Use this file as the source of truth for Security Sprint 01 issues.

## SEC-001 — Triage Gitleaks Findings

Severity: Needs Triage  
Layer: Repository / Secrets

Checklist:

- [ ] Inspect Gitleaks JSON report.
- [ ] Classify each finding.
- [ ] Confirm real secret or false positive.
- [ ] Add `.gitleaks.toml` allowlist only for justified false positives.
- [ ] Rotate any real exposed secret.
- [ ] Retest Gitleaks.

## SEC-002 — Fix DOMPurify Supply-Chain Finding

Severity: Medium  
Layer: Frontend / Supply Chain

Checklist:

- [ ] Run `npm why dompurify`.
- [ ] Run `npm audit fix`.
- [ ] Add npm override if needed.
- [ ] Reinstall dependencies.
- [ ] Run `npm audit --omit=dev`.
- [ ] Run lint/typecheck/build.

## SEC-003 — Complete Kali Toolchain Setup

Severity: Informational  
Layer: Environment

Checklist:

- [ ] Validate Node.
- [ ] Validate npm.
- [ ] Validate Rust.
- [ ] Validate Cargo.
- [ ] Validate Foundry.
- [ ] Validate ZAP.

## SEC-004 — Run Full Rust Validation

Layer: Rust

Checklist:

- [ ] `cargo fmt --all --check`.
- [ ] `cargo clippy --all-targets -- -D warnings`.
- [ ] `cargo test --workspace`.

## SEC-005 — Run Full Foundry Validation

Layer: Solidity / Foundry

Checklist:

- [ ] `forge fmt --check`.
- [ ] `forge build`.
- [ ] `forge test -vvv`.
- [ ] Confirm vulnerable/secure pairs.

## SEC-006 — Run Frontend Security Validation

Layer: Frontend / Admin

Checklist:

- [ ] `npm run lint`.
- [ ] `npm run typecheck`.
- [ ] `npm run build`.
- [ ] Check dangerous frontend patterns.
- [ ] Check admin demo warnings.
- [ ] Check no real wallet or mainnet connection.

## SEC-007 — Run ZAP Baseline

Layer: DAST / Frontend

Checklist:

- [ ] Start frontend locally.
- [ ] Run ZAP baseline.
- [ ] Triage High/Medium alerts.
- [ ] Document false positives.
- [ ] Retest.

## SEC-008 — Publish v0.1.0 Release

Layer: Release

Checklist:

- [ ] Pentest report created.
- [ ] Retest report created.
- [ ] Vulnerability register updated.
- [ ] GitHub checks configured.
- [ ] Release notes created.
- [ ] Tag `v0.1.0`.
- [ ] GitHub release published.
