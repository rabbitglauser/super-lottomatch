---
name: explain-project
description: Core context for SuperLottomatch — a lottery event digitalization app for STV Ennetbürgen. Use when the user asks about the project, its goals, team, constraints, or grading, or when any task requires understanding the project background.
user_invocable: true
---

# SuperLottomatch — Project Overview

When the user invokes this skill, provide a clear structured summary of the project. When used as background context, apply the constraints and grading criteria to the current task.

## School Context

- **Module:** M426 — Software mit agilen Methoden entwickeln
- **School:** Gewerblich-industrielles Bildungszentrum Zug (GIBZ)
- **Teachers:** Claudio Hübscher / Remo Flury
- **Timeline:** 5 weeks
- **Methodology:** Scrum

## Team

| Role | Name |
|------|------|
| Product Owner | Sammy |
| Scrum Master | Amarah |
| Developer | Benji |
| Developer | Oddy |

**GitHub:** rabbitglauser/super-lottomatch

## Problem Statement

STV Ennetbürgen (sports club) organizes an annual **Lottomatch** (lottery event). Part of it is the **Gratis-Verlosung** (free raffle) where guests provide their address on paper slips to participate. Addresses are used for postal marketing for next year's event. Over **80% are returning guests**.

Current semi-digital process:
- Addresses stored in an Excel spreadsheet, each with a unique ID
- Returning guests receive pre-printed slips with their address + ID (no need to fill out a new one)
- New guests fill out blank slips
- During the event, slips are collected and manually matched against the Excel table:
  - Known guests are marked as attending (via ID)
  - New guests are added to the table
  - Guests absent for 3+ years are removed

**Core pain:** The manual matching process is tedious and time-consuming. The ID system only marginally speeds things up.

## Solution Goal

Fully digitalize the process — from guest address entry through to the raffle drawing. Consider that the majority of guests are **40+ years old** when designing the UX.

## Constraints (from assignment)

1. Marketing continues via **postal mail** (email is a future consideration)
2. New guest form must be as **simple and fast** as possible
3. Slip submission must be as **simple and fast** as possible
4. Adding new addresses must be as **simple and fast** for club members
5. Check-in of known guests must be as **simple and fast** as possible
6. Event spans **2 days** — some guests attend both
7. A **laptop** is available at the event
8. Most guests have a **smartphone**
9. All club members have a **smartphone**
10. Customer has **no IT knowledge** — product must be immediately usable in production
11. Must be **OS-independent**
12. **Mobile-friendly** is desired but not required

## Grading Criteria (38 Points Total)

| Category | Points | Key Requirements |
|----------|--------|-----------------|
| Project Proposal | 2 | App within constraints, requirements defined, tech chosen, risks identified |
| Scrum Process | 2 | Roles defined + assigned (1P), self-organizing team (1P) |
| Scrum Events | 8 | Sprint Planning (2P), Daily Scrum (2P), Sprint Review (2P), Sprint Retro (2P) |
| Scrum Artifacts | 5 | Product Backlog (1P), Sprint Backlog (1P), Scrum Board (1P), User Stories (1P), Increment (1P) |
| Documentation | 2 | 1-2 page project description (1P), supporting diagrams/graphics (1P) |
| Source Code | 3 | Clean Code principles (1P), error handling (1P), logical structure (1P) |
| CI/CD | 2 | Auto pipeline on all branches (1P), auto deploy or release bundle (1P) |
| Tests | 2 | Unit tests >75% coverage (1P), tests run in CI and fail build (1P) |
| Final Presentation | 4 | Project idea (1P), technical implementation (1P), Scrum methodology (1P), result (1P) |
| Constraint Compliance | 2 | App meets all constraints (2P) |
| Project Fulfillment | 4 | Works on webserver or local (1P), all requirements met (3P) |
| Class Ranking | 2 | Peer vote — percentage of votes received (2P) |

**Passing:** 36/38 for grade 6.0, max carry-over: 0.5 grades
