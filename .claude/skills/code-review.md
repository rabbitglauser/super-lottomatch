---
name: code-review
description: Review SuperLottomatch code against grading criteria (Clean Code, error handling, logical structure). Use before merging or when the user asks for a code review.
user_invocable: true
---

# Code Review — Grading-Aligned

Review code against the M426 grading criteria for Source Code (3P). If `$ARGUMENTS` specifies files, review those. Otherwise review all staged and changed files.

## Step 1: Gather Changes

Check `git diff --cached` and `git diff` to identify changed files. Read each changed file fully.

## Step 2: Review Against Checklist

### Clean Code (1P)
- [ ] **Naming:** Variables, functions, and classes have meaningful, descriptive names
- [ ] **SRP:** Each function does one thing
- [ ] **No magic values:** No unexplained numbers or strings — use constants
- [ ] **Formatting:** Consistent indentation, spacing, and style
- [ ] **No dead code:** No commented-out code or unused imports
- [ ] **DRY:** No unnecessary duplication

### Error Handling (1P)
- [ ] **Input validation:** All user inputs are validated (especially address fields)
- [ ] **Graceful errors:** API/database errors are caught and handled
- [ ] **User messages:** Error messages are clear and helpful (remember: users are 40+, non-technical)
- [ ] **No silent failures:** No swallowed exceptions or empty catch blocks
- [ ] **Edge cases:** Handles empty fields, duplicates, concurrent check-ins

### Logical Structure (1P)
- [ ] **Separation of concerns:** UI, business logic, and data access are separated
- [ ] **File organization:** Files are in logical directories matching the architecture
- [ ] **Consistent patterns:** Similar operations follow the same patterns
- [ ] **Dependency direction:** Dependencies flow in one direction (no circular imports)

### UX Compliance (Constraint Check)
- [ ] **Accessibility:** Font sizes and contrast appropriate for 40+ users
- [ ] **Simplicity:** Minimal steps for common flows (check-in, address entry)
- [ ] **Language:** UI text is appropriate for German-speaking, non-technical users

### Test Coverage (Related: 2P)
- [ ] New code has corresponding tests
- [ ] Tests cover meaningful scenarios, not just happy paths

## Step 3: Summary

Output a table:

| Criterion | Status | Issues |
|-----------|--------|--------|
| Clean Code (1P) | PASS/FAIL | ... |
| Error Handling (1P) | PASS/FAIL | ... |
| Logical Structure (1P) | PASS/FAIL | ... |
| UX Compliance | PASS/FAIL | ... |
| Test Coverage | PASS/FAIL | ... |

**Grade Risk:** Summarize which points are at risk and what needs fixing.
