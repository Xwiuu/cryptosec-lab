# Security Policy

## Supported Versions

Since this repository is purely educational and contains intencional vulnerabilities, security updates are handled differently.

| Version | Supported |
| ------- | --------- |
| v1.x    | Yes       |

## Reporting a Security Vulnerability

> [!WARNING]
> **This repository contains intencionalmente vulnerable code for research and learning.**
> Do not deploy any code from this repository to production environments.

If you find a security issue in the **infrastructure** or **simulator harness** (e.g., remote execution bug in the API, secrets leakage in scripts, or cross-site scripting in the UI code), please let us know:
1. Open a private issue or contact us at: `security@cryptosec-lab-demo.local` (Replace with your actual contact address).
2. Describe the vulnerability, impact, and reproduction steps.
3. We will review the submission and patch the harness as soon as possible.

**Do NOT report the vulnerabilities in the `contracts/src/vulnerable/` or `contracts/src/advanced/vulnerable/` directories**, as these are intencionally added for educational purposes.
