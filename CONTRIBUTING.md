# Contributing to SuperLottomatch

**Date:** 2026-06-04
**Status:** Ratified

## Branch Rules

- **Never push directly to `main`.** All changes go through pull requests.
- Always create a new branch from `main` for your work.
- Delete your branch after the PR is merged.

## Branch Naming

Use the following prefixes:

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feature/` | New functionality | `feature/qr-scanner` |
| `bugfix/` | Bug fixes | `bugfix/duplicate-checkin` |
| `hotfix/` | Urgent production fixes | `hotfix/login-crash` |
| `refactor/` | Code restructuring | `refactor/guest-service` |
| `docs/` | Documentation changes | `docs/api-contracts` |
| `test/` | Adding or updating tests | `test/raffle-draw` |
| `chore/` | CI, dependencies, tooling | `chore/update-deps` |

## Commit Messages

Use a prefix tag in square brackets followed by a short description:

```
[feature] add guest registration form
[bugfix] fix duplicate check-in on same event
[hotfix] patch JWT token expiry validation
[refactor] extract attendance service from router
[docs] update API contracts in PRD
[test] add unit tests for raffle draw logic
[chore] update GitHub Actions workflow
[style] fix Tailwind class ordering
```

Keep commits small and focused — one logical change per commit.

## Pull Request Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**, commit with the conventions above.

3. **Push your branch:**
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Open a pull request** against `main` on GitHub.

5. **Wait for CI to pass.** All tests must be green and coverage must stay above 75%.

6. **Get at least one review** from a team member before merging.

7. **Merge via GitHub** (squash or merge commit — no direct pushes to `main`).

8. **Delete the branch** after merging.

## Code Guidelines

- Follow clean code principles — meaningful names, small functions, no dead code
- Frontend: use TypeScript strictly (no `any`), follow Tailwind conventions
- Backend: use type hints, Pydantic schemas for all request/response models
- Write tests for new functionality before or alongside the implementation
