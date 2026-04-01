---
name: scrum-artifacts
description: Help create Scrum artifacts and event templates for SuperLottomatch. Use for sprint planning, backlogs, scrum board setup, reviews, retrospectives, or any Scrum process question.
user_invocable: true
---

# Scrum Artifacts & Events for SuperLottomatch

Read the `explain-project` skill for team and timeline context if needed.

This skill covers **15 of 38 grading points** (Scrum Process 2P + Events 8P + Artifacts 5P) — the highest-impact area.

## Team & Timeline

- **5-week project** → recommend 2-3 sprints (2 weeks / 2 weeks / 1 week, or 2/2/1 adjusted)
- **4 team members:** Sammy (PO), Amarah (SM), Benji (Dev), Oddy (Dev)
- PO and SM may also contribute to development given the small team size

## Artifact Templates

### Product Backlog
- Prioritized list of all user stories (use `/generate-user-stories` to populate)
- Columns: ID, Story Title, Priority (MoSCoW), Effort (S/M/L), Sprint, Status
- Recommend using **GitHub Projects** board for tracking

### Sprint Backlog
- Subset of product backlog items committed to for the current sprint
- Include: story, assigned developer, estimated hours, status
- Update daily during standups

### Scrum Board
- **Columns:** Backlog → To Do → In Progress → In Review → Done
- Recommend: GitHub Projects with automated card movement via PR status
- Each card links to the user story and has a clear definition of done

### Increment
- Each sprint must produce a **shippable increment** — working software that can be demonstrated
- Sprint 1: Core data model + basic address CRUD
- Sprint 2: Check-in flow + raffle functionality
- Sprint 3: Polish, CI/CD, documentation, presentation prep

## Event Templates

### Sprint Planning (graded: 2P)
```
Date: [date]
Sprint: [number]
Sprint Goal: [one sentence]

Selected Stories:
| Story | Assignee | Estimate |
|-------|----------|----------|
| ...   | ...      | ...      |

Team Capacity: [hours/points available]
Risks/Dependencies: [list any blockers]
```

### Daily Standup (graded: 2P)
```
Date: [date]
Team Member: [name]
1. What did I do yesterday?
2. What will I do today?
3. Any blockers?
```
Tip: Can be done async via a shared channel if the team doesn't meet daily.

### Sprint Review (graded: 2P)
```
Date: [date]
Sprint: [number]
Sprint Goal: [achieved / partially / not achieved]

Demo:
- Feature 1: [description + who demos]
- Feature 2: [description + who demos]

Stakeholder Feedback:
- ...

Backlog Updates:
- [any new stories or priority changes]
```

### Sprint Retrospective (graded: 2P)
```
Date: [date]
Sprint: [number]

What went well:
- ...

What to improve:
- ...

Action items for next sprint:
| Action | Owner | Deadline |
|--------|-------|----------|
| ...    | ...   | ...      |
```

## Instructions

When invoked, ask which artifact or event the user needs help with. If `$ARGUMENTS` specifies one, generate that directly.
