---
name: generate-docs
description: Generate or update project documentation for SuperLottomatch. Use for README, architecture docs, diagrams, ADRs, or presentation materials.
user_invocable: true
---

# Documentation Generator for SuperLottomatch

Read the `explain-project` skill for project context if needed.

**Grading (2P):** 1-2 page project description (1P) + supporting diagrams/graphics (1P)

## Documentation Targets

| File | Purpose |
|------|---------|
| `README.md` | Project overview, setup instructions, usage guide |
| `docs/ARCHITECTURE.md` | System architecture with diagrams |
| `docs/PRD.md` | Product requirements (has skeleton — fill in sections) |
| `docs/DECISIONS.md` | Architecture Decision Records |

## Diagrams (use Mermaid for GitHub rendering)

Generate these diagram types as needed:
- **System Architecture** — Components and their connections (frontend, backend, database)
- **Data Flow** — Guest submits address → storage → check-in → raffle draw
- **ER Diagram** — Database schema (guests, addresses, events, attendance)
- **User Journey** — Separate flows for new guest, returning guest, and club member
- **Deployment** — How the app is built, tested, and deployed (CI/CD flow)

## Style Guidelines

- Keep language **clear and concise** — the customer (STV Ennetbürgen) has no IT knowledge
- Use **German** for any user-facing documentation shared with the customer
- Use **English** for technical documentation (README, architecture, ADRs)
- Diagrams should be self-explanatory with clear labels
- Documentation should fit within **1-2 pages** for the graded project description

## Instructions

If `$ARGUMENTS` specifies a document (e.g., "architecture", "readme"), update that document. Otherwise, assess the current documentation state across all files and suggest what needs work.
