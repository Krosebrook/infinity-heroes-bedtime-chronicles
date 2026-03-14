<!--
SPDX-License-Identifier: Apache-2.0
-->

# Architecture Decision Records (ADRs)

This folder contains Architecture Decision Records for **Infinity Heroes: Bedtime Chronicles**. An ADR captures a significant architectural decision — why it was made, what alternatives were considered, and what consequences it carries — so that future contributors understand the reasoning and can make informed changes.

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](001-spa-serverless-architecture.md) | Single-Page App with Serverless API Proxy | Accepted | 2026-02 |
| [002](002-indexeddb-client-storage.md) | IndexedDB for Client-Side Persistence | Accepted | 2026-02 |
| [003](003-vercel-deployment-platform.md) | Vercel as Deployment Platform | Accepted | 2026-02 |

## ADR Status Definitions

| Status | Meaning |
|--------|---------|
| **Proposed** | Under discussion |
| **Accepted** | Decision made and implemented |
| **Deprecated** | Was accepted but superseded |
| **Superseded by ADR-NNN** | Replaced by a later decision |

## How to Add a New ADR

1. Copy the template below into a new file `docs/architecture/adr/NNN-short-title.md` (next sequential number).
2. Fill in all sections.
3. Add an entry to the index table above.
4. Submit as part of the PR that implements the decision (or immediately after).

### ADR Template

```markdown
# ADR-NNN: Title

**Date:** YYYY-MM-DD  
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN  
**Deciders:** [list of contributors who made the decision]

## Context

What is the issue or question being decided? What forces are at play?

## Decision

What was decided? State it clearly.

## Alternatives Considered

| Alternative | Reason not chosen |
|-------------|------------------|
| ... | ... |

## Consequences

### Positive
- ...

### Negative / Trade-offs
- ...

## References
- Link to relevant code, issues, or external resources
```

SPDX-License-Identifier: Apache-2.0
