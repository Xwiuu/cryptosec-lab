# CryptoSec Lab v0.1.0 — Initial Public Security Lab Release

CryptoSec Lab is a local-first Blockchain, Smart Contract and DeFi Security research laboratory built with Rust, Solidity, Foundry and Next.js.

This release introduces the first public version of the lab, including vulnerable protocol simulations, secure mitigations, exploit walkthroughs, audit templates, a Rust scanner and a premium Web3 security admin console.

## Highlights

- Rust blockchain core with PoW/PoS concepts.
- Vulnerable-chain simulations for weak consensus and protocol attacks.
- Solidity + Foundry smart contract vulnerability lab.
- Advanced exploit pack covering permit replay, read-only reentrancy, cross-function reentrancy, proxy storage collision and vault share inflation.
- DeFi/DEX attack simulations.
- Rust static analysis scanner.
- Premium Next.js frontend simulator and admin console.
- Audit templates, checklists and security portfolio materials.
- GitHub-ready security documentation and release checklist.

## Security Validation

Initial Kali-based validation has started.

Current findings:

| ID | Severity | Status | Title |
|---|---:|---|---|
| SEC-001 | Needs Triage | Open | Gitleaks detected 10 potential leaks |
| SEC-002 | Medium | Open | DOMPurify vulnerable dependency |
| SEC-003 | Informational | In Progress | Kali toolchain incomplete during first run |
| SEC-004 | Informational | Confirmed | No sensitive files detected by file search |
| SEC-005 | Informational | Needs Review | Security keywords in docs and local scripts |

## Important Security Notice

This project is for educational and research purposes only.

- No mainnet connection.
- No real funds.
- No real wallets.
- No real private keys.
- No real clients.
- All exploit scenarios are intended for local isolated simulation.
- The scanner is heuristic and does not replace manual audit.

## Modules

- `core-chain/` — Rust blockchain core.
- `vulnerable-chain/` — vulnerable blockchain simulation.
- `contracts/` — Solidity + Foundry vulnerability lab.
- `scanner/` — Rust static scanner.
- `frontend-simulator/` — visual simulator and admin console.
- `audits/` — audit templates and checklists.
- `portfolio/` — B2B positioning and sales assets.
- `docs/security/` — security sprint, pentest and retest reports.

## Validation Commands

```bash
cargo test --workspace
```

```bash
cd contracts
forge test -vvv
```

```bash
cd frontend-simulator
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

## Release Status

Status: Pre-release / Security validation in progress.

This release should be considered the initial public lab baseline. Security hardening continues under Security Sprint 01.
