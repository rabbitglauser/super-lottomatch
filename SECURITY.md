# Security Policy — SuperLottomatch

**Date:** 2026-04-25
**Status:** Current

This document describes the security posture of the repository as it exists today, not the long-term target architecture.

## Core principles

1. Least privilege: only grant the access each workflow or developer needs.
2. No secrets in git: credentials stay in environment variables or GitHub secrets.
3. Secure by default where implemented, transparent about current gaps where not.
4. Review before merge: changes with security impact should go through pull requests.

## Current secrets and configuration

### Local development

The local stack uses a root `.env` file for MySQL credentials referenced by `docker-compose.yml`:

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

When running the backend directly, `backend/database.py` reads:

- `DATABASE_HOST`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`

### GitHub Actions

The release workflow uses the built-in `GITHUB_TOKEN` to create GitHub releases and upload bundle artifacts.

No AI provider secret or mail provider secret is required by the current application code.

## Current implementation notes

- The backend currently exposes a minimal email/password login endpoint at `POST /auth/login`.
- User records are bootstrapped from `database/init/init.sql`.
- Passwords are currently stored and compared in plain text for local/demo use.

That last point is a known security limitation and should be treated as non-production-ready. Any real deployment should switch to hashed passwords before broader use.

## Repository rules

- Never commit `.env` files, raw credentials, tokens, or local machine config.
- Keep `.gitignore` entries for `.env`, `.env.local`, `*.pem`, and local editor folders.
- Do not hardcode secrets into frontend code, backend code, or workflow files.
- If a secret may have leaked, rotate it immediately and remove it from history if necessary.

## GitHub Actions security

- Workflow action versions are pinned in `.github/workflows/`.
- Workflow permissions are explicitly declared.
- Secrets should only be exposed to jobs that require them.

## Code and dependency hygiene

- Validate untrusted input on the backend.
- Keep dependencies updated and review security advisories regularly.
- Treat database bootstrap SQL and seed data as development/demo assets, not production credentials.

## Reporting vulnerabilities

If you discover a vulnerability:

1. Do not open a public GitHub issue with exploit details.
2. Contact the maintainers directly.
3. Coordinate a fix before public disclosure.

## Developer checklist

- [ ] No secrets were added to tracked files
- [ ] New environment variables are documented
- [ ] Security-relevant behaviour changes are covered by docs and tests where practical
- [ ] Plaintext development credentials were not copied into production-facing configs
