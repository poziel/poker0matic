---
name: linear-issue-creator
description: >
  Transforms rough feature ideas, voice memos, or informal product thoughts into
  professional Linear issues and creates them directly via the Linear MCP integration.
  Use this skill whenever the user wants to create a Linear issue, turn a feature idea
  into a ticket, log a bug in Linear, write up a task for their team, or says anything
  like "create an issue", "add this to Linear", "make a ticket for", "log this in Linear",
  or "write up a Linear issue". Trigger even for vague or informal descriptions — the
  skill's job is to professionalize them. Always use this skill when Linear is mentioned
  alongside any kind of task, feature, bug, or improvement idea.
compatibility: "Requires Linear MCP integration to be connected"
---

# Linear Issue Creator

Turns informal feature descriptions, rough notes, or voice-memo-style thoughts into
clean, developer-friendly Linear issues — and creates them directly via the Linear MCP.

---

## Step 1: Gather Context

Before writing anything, ask the user:

1. **Which Linear project should this issue go into?**
   - Ask explicitly — do not assume or guess.
   - Example: *"Which Linear project should I create this in?"*

2. **Do you have a rough idea of priority?** *(optional — offer suggestions if skipped)*
   - Urgent / High / Medium / Low

If the user's message is too vague to extract a coherent issue (e.g., a single word or a half-thought), ask one clarifying question to unlock enough context. Otherwise, proceed directly.

---

## Step 2: Draft the Issue

### Title

- Concise, action-oriented, sentence-case
- Format: `[Verb] [subject]` — e.g., *"Add garage status filter to order list"*
- No ticket numbers, no emojis, no jargon

### Description (use this exact structure)

\```
# Description

As a [type of user], I want [goal], so that [benefit].

[1–3 sentences of additional context or motivation.]

# Acceptance Criteria

- [Observable, testable behavior]
- [Observable, testable behavior]
- [...]

# Architecture

- [Technical approach or constraint]
- [Scalability / refactor note if relevant]
\```

### Priority & Label Suggestions

After drafting the issue, suggest:

- **Priority**: Based on user impact and urgency cues in the description
  - *Urgent*: Blocking users or production issues
  - *High*: Key feature, strong user need
  - *Medium*: Useful improvement, non-blocking
  - *Low*: Nice-to-have, polish
- **Labels**: Suggest 1–2 from common categories:
  - `feature`, `bug`, `improvement`, `tech-debt`, `UX`, `performance`, `security`

Present these as suggestions — let the user confirm or override before creating.

---

## Step 3: Confirm & Create

1. Show the full drafted issue to the user (title + description + priority/label suggestions)
2. Ask: *"Does this look good, or would you like to adjust anything?"*
3. Once confirmed, **create the issue using the Linear MCP tool** — do not just return markdown.
4. Pass the confirmed priority and labels when creating the issue.

---

## Step 4: Return Summary

After the issue is created, return exactly this:

\```
✅ Issue created in Linear

**Title**: [issue title]
**URL**: [Linear issue URL]
**Priority**: [priority]
**Labels**: [labels]

Ready for the next issue.
\```

---

## Rules

- Always create the issue via Linear MCP — never only return the markdown
- Keep the original intent intact — do not invent unrelated features
- Acceptance Criteria = observable, testable behavior only (no implementation details)
- Architecture = technical approach, constraints, scalability notes (not UX)
- Preserve important UI/UX detail from the user's description
- Keep the issue professional, readable, and developer-friendly
- Every new message after issue creation = a brand new issue request

---

## Example Input → Output

**User says:** *"we need to let garage users filter by order status on the main list, right now they have to scroll through everything"*

**Drafted title:** `Add order status filter to garage client list view`

**Description:**
\```
# Description

As a garage client, I want to filter the order list by status, so that I can quickly find
relevant orders without scrolling through the full list.

Currently, the list displays all orders regardless of status, making it difficult to triage
active or pending work at a glance.

# Acceptance Criteria

- A status filter control is visible on the order list view
- Selecting a status updates the list to show only matching orders
- Clearing the filter restores the full list
- Filter state is preserved during the session

# Architecture

- Filter logic should be handled client-side if the full list is already loaded; otherwise
  add a query parameter to the existing list API endpoint
- Ensure the filter component is reusable for potential future filter types
\```

**Priority suggestion:** High  
**Label suggestions:** `feature`, `UX`