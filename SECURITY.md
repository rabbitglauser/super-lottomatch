# Security Policy — SuperLottomatch

## Core Principles

1. **Least Privilege:** Every service and person receives only the minimum permissions necessary.
2. **Defense in Depth:** Multiple layers of security protect the system — no single measure is solely responsible.
3. **No Secrets in Code:** Credentials, API keys, and tokens are managed exclusively through secure storage, never directly in source code.
4. **Secure by Default:** New features are built with security in mind from the start, not patched after the fact.

---

## Secrets & API Keys

### Storage

| Secret | Storage Location | Access |
|--------|-----------------|--------|
| Claude API Key (`ANTHROPIC_API_KEY`) | GitHub → Settings → Secrets and variables → Actions | GitHub Actions Workflows only |
| Database Credentials | GitHub Actions Secrets / Environment variables | Available at runtime only |
| Workflow Tokens (`GITHUB_TOKEN`) | Automatically provided by GitHub | Only within the respective workflow run |
| Other API Keys | GitHub Actions Secrets | Only in workflows that require them |

### Rules

- **No secrets in commits:** `.env` files, API keys, and passwords must never be committed.
- **`.gitignore`** must include at least: `.env`, `.env.local`, `*.pem`, `credentials.json`, `.idea/`.
- **Secret rotation:** API keys are rotated immediately if a compromise is suspected.
- **No hardcoding:** All secrets are injected via environment variables or GitHub Actions Secrets, e.g.:
  ```yaml
  # .github/workflows/example.yml
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  ```

---

## GitHub Actions Security

- Workflows use **pinned action versions** (SHA instead of tag) to prevent supply-chain attacks.
- **`GITHUB_TOKEN` permissions** are restricted per workflow to the minimum required:
  ```yaml
  permissions:
    contents: read
    pull-requests: write
  ```
- Secrets are only passed to workflows that actually need them.
- Third-party actions are reviewed before use.

---

## Code Security

- **Dependency Scanning:** Dependencies are regularly checked for known vulnerabilities (e.g. Dependabot).
- **Code Reviews:** Every pull request is reviewed by at least one team member before merging.
- **Branch Protection:** The `main` branch is protected — direct pushes are not allowed, only merges via pull requests.
- **Input Validation:** User inputs are validated server-side to prevent injection attacks (SQL, XSS, Command Injection).

---

## Reporting Vulnerabilities

If a security vulnerability is discovered:

1. **Do not report publicly** (no GitHub Issue).
2. Contact team members directly (e.g. via Teams/Discord).
3. The vulnerability will be assessed within the team and fixed with appropriate priority.

---

## Developer Checklist

- [ ] No secrets in code or commit messages
- [ ] `.env` files are listed in `.gitignore`
- [ ] API keys are stored in GitHub Actions Secrets
- [ ] User inputs are validated and sanitized
- [ ] Dependencies are up to date and free of known vulnerabilities
- [ ] Pull requests are reviewed before merging
