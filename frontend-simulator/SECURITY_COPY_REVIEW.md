# CryptoSec Frontend Simulator Security Copy Review

## Required Language Coverage

| Required Text | Status | Where Covered |
| --- | --- | --- |
| `Local simulation only.` | PASS | Status bar and high-risk route notices |
| `No real funds.` | PASS | Wallet, DEX, lending, stablecoin, bridge, settings, status bar |
| `No mainnet connection.` | PASS | Status bar and high-risk route notices |
| `Educational lab — not a replacement for manual security review.` | PASS | Scanner, audit, reports |
| `Demo seed — not a real wallet.` | PASS | Wallet notice and seed warning |

## Route Review

| Route | Risk | Copy Status |
| --- | --- | --- |
| `/wallet` | Demo seed, mock key/signature confusion | PASS: states demo seed, no real wallet, no real funds, no mainnet |
| `/scanner` | Scanner could be mistaken for full audit | PASS: states heuristic/local and not a replacement for manual review |
| `/audit` | Simulated report could be mistaken for certification | PASS: states simulated, not certification, not replacement for manual review |
| `/reports` | Sample reports could be mistaken for attestations | PASS: states examples are not official certifications |
| `/contracts` | Exploit steps could be misused | PASS: states educational/local only and not against third parties |
| `/vulnerabilities` | Attack catalog could imply real exploitation | PASS: states local/no-mainnet and no third-party execution |
| `/dex` | Swap/MEV simulation could imply funds | PASS: states no real funds, swaps, approvals, or mainnet |
| `/lending` | Borrow/liquidation simulation could imply positions | PASS: states no real funds, loans, collateral, or mainnet |
| `/stablecoin` | Mint/depeg simulation could imply token actions | PASS: states no real funds, minting, redemption, collateral, or mainnet |
| `/dao` | Treasury drain simulation could imply governance action | PASS: states no real votes, transfers, or mainnet |
| `/nft` | Metadata/ownership could imply real NFTs | PASS: states mock metadata, mints, listings, ownership, no mainnet |
| `/bridge` | Bridge replay could imply real cross-chain messaging | PASS: states no real funds, validator signatures, bridge messages, or mainnet |

## Security Decisions

- No MetaMask or wallet connection is present.
- No seed generation for real use is present.
- No mainnet labels remain in bridge mock data.
- Scanner and audit language avoids guarantees and avoids promising absolute security.
- Reports are framed as educational examples, not certifications.
- Production dependency audit reports 0 vulnerabilities after pinning transitive `dompurify` and `postcss` through npm overrides.

## Remaining Security Copy Limitations

- A future Rust API integration must preserve the local-only defaults and keep mainnet disabled by configuration.
- If wallet connection is ever added for demos, it should use a local mock provider only and require a new copy/security review.
