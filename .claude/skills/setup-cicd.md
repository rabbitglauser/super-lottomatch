---
name: setup-cicd
description: Set up or modify the CI/CD pipeline for SuperLottomatch. Use when the user asks about CI/CD, GitHub Actions, deployment, or automated testing pipelines.
user_invocable: true
---

# CI/CD Pipeline Setup for SuperLottomatch

**Grading Requirements (2P):**
1. **(1P)** Automated CI/CD pipeline triggers on **every commit to ALL branches** (not just main)
2. **(1P)** Application is either auto-deployed to a webserver OR files are bundled into a release/installer

## Step 1: Detect Stack

Check the project for build configuration files (package.json, pom.xml, build.gradle, etc.) to determine:
- Build tool and commands
- Test runner and commands
- How to produce a deployable artifact

## Step 2: Create GitHub Actions Workflow

Create `.github/workflows/ci.yml` with these stages:

1. **Install** — Install dependencies
2. **Lint** — Run linter/formatter check (if configured)
3. **Test** — Run unit tests with coverage reporting; **fail build if any test fails**
4. **Coverage Gate** — Fail if coverage drops below 75%
5. **Build** — Compile/bundle the application
6. **Deploy/Release** — On the main/release branch: deploy to webserver OR create a release artifact

### Key Requirements
- Trigger: `on: push` and `on: pull_request` for **all branches** (use `branches: ['**']` or omit branch filter)
- Tests must block the build on failure
- Coverage report should be visible in the workflow output
- Artifacts (build output) should be uploaded for release branches

## Step 3: Verify

- Confirm the workflow file has correct YAML syntax
- Verify trigger configuration covers all branches
- Check that test and build commands match the project's actual tooling

If `$ARGUMENTS` specifies a specific CI/CD task (e.g., "add deployment step"), focus on that rather than creating the full pipeline from scratch.
