## Initialize AGENTS.md and minimal memory layout

This PR adds:

- AGENTS.md: Defines the long-lived AI assistant role, work rules, memory handling, and task lifecycle for the repository. This file is the core contract for how the personal AI will use this repository as a persistent workspace.
- MEMORY.md: Minimal spec for memory/ usage and example metadata header.
- memory/ directory with longterm/ and daily/ placeholders and a memory/index.md.

Why:
- Store important state, user preferences, and long-term notes in repo files so the Copilot agent can persist and reference memory across conversations.

What I tested:
- Files were created on branch `agents/init-2026-07-29` and committed.

Next steps (suggested):
- Merge this PR to add the agent contract and memory scaffolding.
- Optionally, create a scheduled job or GitHub Action to run monthly memory-review tasks to summarize daily notes into longterm memory.

---

Checklist for reviewers:
- [ ] AGENTS.md is clear and matches the user's expectations for the agent's responsibilities.
- [ ] MEMORY.md and memory/ structure are sufficient and appropriately lightweight.
- [ ] No secrets are included.
