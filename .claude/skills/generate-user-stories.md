---
name: generate-user-stories
description: Generate user stories for SuperLottomatch from project requirements. Use when the user asks to create user stories, plan features, or populate the product backlog.
user_invocable: true
---

# Generate User Stories for SuperLottomatch

Read the `explain-project` skill for full project context if needed.

## Personas

| Persona | Description |
|---------|-------------|
| **New Guest** | First-time Lottomatch attendee, likely 40+, may not be tech-savvy |
| **Returning Guest** | Has attended before, has an existing address record with ID |
| **Club Member** | STV Ennetbürgen member, operates the system at the event, has smartphone |
| **Event Organizer** | Manages the overall raffle process, address database, and marketing |

## Epics

1. **Address Collection** — Guest registration and address entry
2. **Check-in** — Marking known guests as present at the event
3. **Raffle** — Drawing winners from participants
4. **Administration** — Address management, cleanup, marketing preparation

## Output Format

For each user story, generate:

```
### [EPIC-ID] Story Title
**As a** [persona],
**I want** [goal],
**so that** [reason].

**Acceptance Criteria:**
- [ ] ...
- [ ] ...

**Priority:** Must / Should / Could / Won't
**Effort:** S / M / L
```

## Guidelines

- Consider the **elderly demographic** (40+) for all UX-related stories — large text, simple flows, minimal steps
- Account for the **2-day event** structure — guests may check in on both days
- Remember: customer has **no IT knowledge** — admin UX must be dead simple
- Include stories for the **postal marketing** workflow (address export, letter generation)
- Each story must have testable acceptance criteria
- If `$ARGUMENTS` specifies a feature area or persona, focus on that. Otherwise generate a comprehensive backlog.
