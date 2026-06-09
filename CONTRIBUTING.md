# Contributing Guide

Welcome to the CryptoSec Lab! We appreciate your interest in contributing to our educational blockchain security laboratory.

## Code of Conduct

Please be respectful and professional in all communication. Keep in mind that this is an educational resource.

## How Can I Contribute?

### 1. Adding New Vulnerabilities
If you want to add a new vulnerability:
- Place the vulnerable contract in `contracts/src/vulnerable/` or `contracts/src/advanced/vulnerable/`.
- Place the secure contract with proper mitigations in `contracts/src/secure/` or `contracts/src/advanced/secure/`.
- Add an attack contract in `contracts/src/attacks/` or `contracts/src/advanced/attacks/` if required.
- Write a test suite in `contracts/test/` verifying the exploit works on the vulnerable contract and fails on the secure contract.
- Document it under `exploits/`.

### 2. Scanner Enhancements
Improve the static analysis rules in `scanner/src/rules/` to catch more vulnerabilities.

### 3. Simulator Features
Expand the visual simulator in `frontend-simulator/` with new pages or interactive playground scenarios.

## Development Setup

### Rust Core
```bash
cargo fmt --all
cargo clippy --all-targets -- -D warnings
cargo test
```

### Smart Contracts (Foundry)
```bash
cd contracts
C:\Users\User\.foundry\bin\forge.exe fmt
C:\Users\User\.foundry\bin\forge.exe test
```

### Next.js Frontend
```bash
cd frontend-simulator
npm run lint
npm run typecheck
npm run dev
```
