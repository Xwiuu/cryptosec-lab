# 🚀 GitHub Release & Publication Checklist

Use this checklist to perform final verification before pushing the repository to a public GitHub workspace.

---

## 1. Automated Test Verification

- [ ] **Rust Workspace Core**:
  - Run `cargo test --workspace` and ensure 100% pass rate.
  - Run `cargo fmt --all --check` to verify code format.
  - Run `cargo clippy --all-targets -- -D warnings` and verify zero compiler warnings.
- [ ] **Solidity contracts (Foundry)**:
  - Run `C:\Users\User\.foundry\bin\forge.exe test -vvv` and ensure all test suites pass.
  - Run `C:\Users\User\.foundry\bin\forge.exe fmt --check` to verify code format.
- [ ] **Frontend simulator (Next.js)**:
  - Run `npm run lint` and verify zero linter errors.
  - Run `npm run typecheck` to verify TypeScript compilation.
  - Run `npm run build` and ensure production build completes with success.

---

## 2. Security & Secrets Scanning

- [ ] **No committed secrets**:
  - Check `git status` for untracked env files.
  - Scan history for real private keys, validator seed phrases, or credentials.
  - Ensure `.env` is listed in `.gitignore`.
- [ ] **No local cache directories committed**:
  - Verify `target/`, `node_modules/`, `.next/`, `cache/`, `out/`, `dist/` directories are ignored.

---

## 3. Disclaimers & Regulatory Notices

- [ ] **Ethical Warning**:
  - `README.md` features the prominent `EDUCATIONAL PURPOSES ONLY` alert block.
  - `DISCLAIMER.md` is present at the root.
  - `ETHICAL_USE.md` is present at the root.
- [ ] **Simulated Context Visibility**:
  - Frontend simulator footer displays the "local simulation only" note.
  - Admin Console displays the global warning notice explaining that all records (client names, project data, vulnerability reviews) are mock demonstration assets.

---

## 4. GitHub Optimizations

- [ ] **GitHub Language Stats (.gitattributes)**:
  - `.gitattributes` is present at the root.
  - Files under `/frontend-simulator/` are correctly marked as `linguist-generated` or `linguist-vendored`.
  - Rust and Solidity files are explicitly set.
- [ ] **GitHub Metadata**:
  - Issue templates are present in `.github/ISSUE_TEMPLATE/` (bug reports, lab proposals).
  - PR template is present in `.github/PULL_REQUEST_TEMPLATE.md`.
  - Contribution guidelines are present in `CONTRIBUTING.md`.
  - Security policy is present in `SECURITY.md`.
  - LICENSE is present.

---

## 5. Assets & Visuals

- [ ] **Diagrams**:
  - Verify Mermaid syntax compiles correctly.
  - Diagram files are saved under `assets/diagrams/`.
- [ ] **Screenshots placeholder**:
  - Capture screenshots of the running simulator and Admin Console to place in `assets/screenshots/`.
