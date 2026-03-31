---
name: generate-tests
description: Generate unit tests for SuperLottomatch targeting >75% coverage. Use when the user asks to write tests, improve coverage, or create tests for a specific module.
user_invocable: true
---

# Generate Tests for SuperLottomatch

**Coverage Target:** >75% (grading requirement — 2P)

Tests must also run automatically in the CI pipeline and fail the build if any test fails.

## Step 1: Detect Test Framework

Check the project's build configuration (package.json, pom.xml, build.gradle, etc.) to determine:
- Programming language and framework in use
- Test framework already configured (Jest, JUnit, pytest, etc.)
- Existing test directory structure and naming conventions

Follow whatever conventions already exist. If none exist yet, recommend a test framework appropriate for the stack.

## Step 2: Identify What to Test

If `$ARGUMENTS` specifies a file or module, generate tests for that. Otherwise:

1. Find all source files with business logic
2. Check which already have tests
3. Prioritize untested or under-tested files

### Priority Order for Business Logic
1. **Address validation** — field requirements, format validation, duplicate detection
2. **Check-in logic** — marking guests as present, handling 2-day attendance
3. **Raffle/drawing logic** — random selection, ensuring only checked-in guests participate
4. **Guest management** — CRUD operations, 3-year cleanup rule
5. **API endpoints** — request/response validation, error responses

## Step 3: Write Tests

For each test file:
- Test the **happy path** first
- Test **edge cases**: empty input, duplicate entries, boundary values
- Test **error paths**: invalid data, missing fields, unauthorized access
- Use descriptive test names that explain the expected behavior
- Keep tests independent — no shared mutable state between tests

## Step 4: Verify

Run the full test suite and report:
- Total tests / passing / failing
- Coverage percentage (if coverage tooling is available)
- Any issues found
