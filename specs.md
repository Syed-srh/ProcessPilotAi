## Project Overview

Build a full-stack AI-powered Business Process Automation Platform called **ProcessPilot AI**.

The platform allows operators to describe a business process or SOP in natural language and transform it into a structured, visual, executable workflow.

Core product loop:

```text
Describe → Generate → Review → Simulate → Approve → Execute → Validate → Monitor → Audit → Optimize
```

**Core product principle (state this prominently — it's your thesis):**
> AI decides within boundaries. The workflow engine controls execution. Humans remain in control of high-risk actions.

The platform must prioritize **controlled automation**, not unrestricted autonomous AI. AI makes decisions only within the permissions and boundaries defined by the compiled workflow.

---

## MVP Scope (v1) vs. Stretch Scope (v2)

This is the single most important addition to this spec. Build v1 completely — tested and deployed — before touching anything in v2.

### v1 — Build this fully (target: one working end-to-end demo)
- Auth (register/login/JWT, roles: `ADMIN`, `OPERATOR`, `VIEWER`)
- SOP → workflow generation (AI-generated, schema-validated, deterministic fallback)
- Visual workflow canvas (React Flow) with manual editing
- 8 core node types only (see Node Types section)
- Multi-agent execution engine: Planner, Decision, Execution, Validation, Recovery, Monitoring
- Business rules engine (deterministic, separate from the LLM)
- Human-in-the-loop approval queue with an explicit, precise approval-trigger rule
- Simulation mode (dry-run, no real side effects)
- Execution audit trail (immutable snapshots, full timeline)
- One fully working demo SOP end-to-end: **refund processing**
- Real deployment: live URL, working CI pipeline

### v2 — Design for, build only if time remains
- RAG pipeline (only if tied to a concrete step in your demo SOP — see RAG section)
- Second and third SOP types (employee onboarding, expense approval) to prove generalization
- Remaining node types (loops, schedule triggers, webhook triggers, Slack/Discord/Sheets integrations)
- Background job scheduling for recurring/scheduled workflows
- Analytics dashboard with optimization suggestions
- Multi-tenant organizations (v1 assumes a single organization / internal-tool model — see Tenancy Decision below)

---

## Tenancy Decision (must be explicit, not implied)

**v1 decision: single-tenant.** ProcessPilot AI v1 is built as one company's internal tool — all users share one workspace, differentiated only by role (`ADMIN` / `OPERATOR` / `VIEWER`). There is no `Organization` entity in v1.

To avoid a costly rewrite later, every table still carries an `ownerId` (creator) field, and the schema is written so an `orgId` column can be added in v2 without breaking existing queries. Don't build org-switching UI or cross-org isolation logic in v1 — it's unused complexity until you actually need multi-tenant SaaS.

---

## Free-Tier Technology Stack

### Frontend
- **Next.js (Pages Router) + React + TypeScript** — no cost, self-hosted/deployed free (see Deployment).
- **Tailwind CSS, Zustand, Axios, React Hook Form, Zod** — all free, open-source libraries.
- **React Flow (`@xyflow/react`)** — free/open-source for the workflow canvas.
- **Socket.IO Client** — free, open-source.

### Backend
- **Node.js + Express + TypeScript** — free.
- **Prisma ORM** — free, open-source.
- **PostgreSQL** — hosted free via **Supabase** (free tier: ~500MB database, pgvector included at no extra cost, no card required) or **Neon** (free tier: ~3GB across branches, serverless, scale-to-zero, pgvector supported). Pick Supabase if you might use its bundled auth/storage later; pick Neon if you want plain Postgres with branching for CI test databases. Either is fine for v1.
- **Redis** — for BullMQ background jobs, use **Upstash Redis** (free tier: ~256MB, both REST and TCP-compatible endpoints — confirm TCP support on the current plan, since BullMQ needs a persistent connection, not just REST). If BullMQ's TCP requirement doesn't fit the free Upstash plan when you check it, fall back to running Redis in a local Docker container for development and defer hosted background jobs to v2 (v1 can run retries synchronously with in-process backoff instead of a full queue).
- **bcrypt, JWT, Helmet, express-rate-limit, express-validator/Zod** — free, open-source.

### AI Providers (the part you specifically asked about)
Use a **two-tier free fallback chain** so you're never blocked by one provider's rate limit:

1. **Primary: Google Gemini API (`gemini-2.5-flash` or `gemini-2.5-flash-lite`)** via Google AI Studio.
   - Free, no credit card, no expiration.
   - Flash: ~1,500 requests/day, 1M tokens/minute. Flash-Lite: even higher daily request cap, slightly lower quality — good for high-volume agent calls like the Monitoring/Recovery agents.
   - 1M-token context window, function calling, and JSON mode all included free — JSON mode is what you'll use for schema-validated structured output (workflow graphs, agent decisions).
   - Caveat: Google may use free-tier inputs/outputs to improve their models — don't put real customer PII in test data; use synthetic mock data for your refund/order demo.
   - **Do not enable billing on this project** — enabling billing removes the free tier entirely on that project (this is Gemini-specific behavior, not how other Google Cloud services work). Keep a dedicated, billing-free Google Cloud project for this app.

2. **Fallback: Groq (`llama-3.3-70b-versatile` or similar open model)**.
   - Free, no credit card, indefinite.
   - ~30 requests/minute, ~1,000 requests/day, ~6,000–14,400 tokens/minute depending on model — tighter than Gemini but extremely fast inference (LPU hardware), which is useful for latency-sensitive agent steps.
   - Use this as the automatic fallback when Gemini returns a 429 (rate limit), so your execution engine doesn't stall mid-run.

3. **Final fallback: deterministic rule-based generator** (no AI at all) — for when both providers are rate-limited or a key is missing. This must still produce a runnable, if simplified, graph for the known SOP patterns you support (refund, onboarding, expense approval keywords → template graph).

**Cost/rate-limit safety requirement (add this — it was missing from the original spec):** define a **per-execution AI-call budget**, e.g., "a single workflow run may make at most N LLM calls across all agents before it force-escalates to human review with an `AI_BUDGET_EXCEEDED` reason." This protects you from a misbehaving loop or a chatty agent chain silently burning your entire daily free quota on one run. Also implement exponential backoff (1s → 2s → 4s → 8s) on 429 responses before falling back to the next provider in the chain.

### RAG (v2, optional)
If you build RAG, keep it free:
- **Vector store:** pgvector on the same Supabase/Neon Postgres instance (already free, no separate vector DB needed for a project this size).
- **Embeddings:** Gemini's embedding endpoint (free tier) or a self-hosted open-source model (e.g., `sentence-transformers/all-MiniLM-L6-v2` run locally in your Node/Python service) if you want to avoid any embedding API calls entirely.
- Only build this if it's tied to a real step in your demo — e.g., "the refund-policy-check step retrieves the actual policy text from an uploaded company policy PDF via RAG." Don't build ingestion/chunking/retrieval infrastructure that nothing in your demo exercises.

### Infrastructure & Deployment (all free tiers)
- **Frontend hosting:** **Vercel** free tier — native Next.js support, generous free bandwidth/build minutes for a hobby/portfolio project, automatic preview deployments per PR.
- **Backend hosting:** **Render** free tier — free web service (persistent hours per month, spins down after ~15 minutes of inactivity, ~1 minute cold-start on the next request). This spin-down is fine for a portfolio demo; just mention it in your README so a reviewer isn't confused by the first-load delay.
- **Database:** Supabase or Neon free Postgres (see above) — do **not** use Render's own free Postgres for your primary database, since Render's free database tier expires after a fixed window (commonly 30–90 days) and will silently delete your data; Supabase/Neon's free tiers are indefinite.
- **Redis/Queue:** Upstash free tier (see above), or defer to v2 if the TCP/BullMQ fit doesn't work out on the free plan.
- **CI/CD:** **GitHub Actions** — free minutes are generous for a public repo (effectively unlimited) and sufficient for private repos on a personal account for a project this size. Run lint + unit + integration tests on every PR; build/deploy on merge to `main`.
- **Containerization:** Docker for local dev parity — free, open-source; you don't need paid container registry hosting since Render/Vercel build directly from your Git repo.

**Bottom line on the free stack:** Gemini (primary) + Groq (fallback) + deterministic builder (final fallback) for AI; Supabase or Neon for Postgres/pgvector; Upstash for Redis; Vercel for frontend; Render for backend; GitHub Actions for CI. Nothing here requires a credit card, and every limit above is generous enough for a portfolio-scale demo with room to spare — just don't run load tests against your own free-tier keys the night before a demo.

---

## Authentication & Authorization

Supports registration, login, logout, JWT-based authentication, protected routes, `/auth/me`, bcrypt password hashing, role-based authorization, session persistence, token expiration.

### Roles
```text
ADMIN     — manage users, integrations, all workflows, system config
OPERATOR  — create/edit/execute workflows, view executions
VIEWER    — view workflows and execution history only, cannot execute or approve
```
Add a fourth conceptual permission (not necessarily a fourth role in v1): **approval capability** — whoever can act on the Approval Queue. In v1, grant this to `ADMIN` and a flagged subset of `OPERATOR` users (`canApprove: boolean` on the user record) rather than building a full separate role table.

---

## Workflow Management

```text
Workflow
 ├── Trigger
 ├── Nodes
 ├── Edges
 ├── Variables
 ├── Conditions
 ├── Version
 └── Execution Configuration
```

Status: `DRAFT | ACTIVE | PAUSED | ARCHIVED`

---

## Node Types

### v1 — build these 8 only
- **Manual Trigger** (start a run on demand)
- **AI Decision** (LLM-backed decision with structured output + confidence score)
- **Condition** (deterministic branch, e.g., amount ≥ threshold)
- **Human Approval** (pauses run, creates Approval Queue entry)
- **HTTP Request** (generic outbound call — covers "process refund via payment provider" using Stripe test mode or a mocked endpoint)
- **Send Email** (via a free-tier transactional email provider — confirm current free sending limits before committing)
- **Schema Validation** (validates a step's output against an expected shape before continuing)
- **Database Query/Update** (read/write against your own Postgres — used for "verify order exists" against a seeded mock orders table)

### v2 — add later, same architecture
Webhook Trigger, Schedule Trigger, Form Trigger, AI Classification, AI Extraction, AI Summarization, AI Agent (multi-tool), Switch, Loop (must ship with a **required `maxIterations` field** — an unbounded loop node is a real production hazard, don't add this node type without the cap built in from day one), Delay, Human Input, Create Task, Notification, Business Rule Validation (beyond the basic Condition node), Slack/Discord/Google Sheets actions.

---

## Natural Language Workflow Generation

`POST /api/workflows/generate` — user submits SOP text, receives a schema-validated structured workflow. AI output must be validated against a strict Zod schema before it is ever persisted as an executable workflow. Invalid AI output is rejected and surfaced to the user with a specific reason, never silently coerced into something runnable.

**Provider order:** Gemini (primary) → Groq (fallback on rate limit/error) → deterministic keyword-based builder (final fallback, always available, no API key required).

---

## Agentic Orchestration

LangGraph is the orchestration substrate. Each execution maintains a structured `ExecutionState`: workflow, currentNode, inputs, outputs, variables, agentMessages, errors, retryCount, approvalState, executionStatus, **and `aiCallCount`** (tracked against the per-execution AI-call budget described above).

### 1. Planner Agent
Determines next valid step, checks dependencies, produces a structured execution plan with a confidence score.

### 2. Decision Agent
Used for AI Decision nodes. Analyzes structured input, applies business rules where declared, retrieves knowledge (v2/RAG) when configured, and returns a structured decision + reasoning summary + confidence score. Must not return arbitrary executable code — only data conforming to the declared output schema.

### 3. Execution Agent
Runs action nodes, calls integrations, passes structured data between nodes, respects workflow permissions.

### 4. Validation Agent
Validates required output fields, data types, and business rules after each significant action. Invalid results never silently continue to the next node.

### 5. Recovery Agent
Classifies failures: `MISSING_DATA | INVALID_INPUT | AUTH_EXPIRED | RATE_LIMIT | TIMEOUT | API_FAILURE | BUSINESS_RULE_FAILURE | AI_BUDGET_EXCEEDED | UNKNOWN`.
Decisions: `RETRY | RETRY_WITH_BACKOFF | SKIP | REQUEST_HUMAN | TERMINATE`.

### 6. Monitoring Agent
Records agent activity, node activity, execution state, timing, warnings, errors, success events — every event becomes one `ExecutionLog` row.

---

## Human-in-the-Loop System — Explicit Approval Rule

This was underspecified in the original draft. Make the rule precise and code it exactly like this:

```text
requiresApproval =
    (workflow step declares approval_required = true, evaluated against its configured
     threshold — e.g., refund.amount >= step.config.approvalThreshold)
    OR
    (decisionAgent.confidence < workflow.minConfidenceThreshold)
```

Both conditions are checked by the **Approval Gate**, which runs as part of the Validation Agent's pass (don't add a 7th agent for this in v1 — fold it into Validation to keep the agent count manageable). Whichever condition is true, the run pauses to `AWAITING_APPROVAL` and an `Approval` record is created containing: workflow, execution, node, requested action, relevant data, reasoning, risk level, and which rule triggered it (threshold vs. low-confidence) — this last field matters for your audit story ("why did this pause?").

The execution remains `PAUSED`/`AWAITING_APPROVAL` until an authorized user (`ADMIN` or `canApprove` operator) approves, rejects, or edits-and-approves it.

---

## Workflow Simulation

Every workflow supports simulation mode. Simulation executes internal logic (conditions, AI decisions, rule evaluation) but **never** performs real side effects — external action nodes (HTTP Request, Send Email, Database Update) produce mock results instead of real calls. This lets you validate a newly compiled workflow against sample data before it can touch real systems.

```text
Simulation:
POST /refund
Would send: { "orderId": "ORD-1029", "amount": 7500 }
Actual API call: SKIPPED
```

---

## Business Rules Engine

Deterministic, evaluated separately from the LLM. Supports: equals, not equals, greater than, less than, ≥, ≤, contains, AND, OR. Returns a structured result. Example:

```text
IF refund.amount <= 5000 THEN approval = AUTO
IF refund.amount > 5000 THEN approval = HUMAN
```

---

## Integrations (v1)

- **Database** — read/write against your own Postgres (mock orders/customers table for the refund demo).
- **HTTP Request** — generic outbound calls (Stripe test-mode API for "process the refund," or a mocked endpoint if you'd rather not wire up Stripe at all for v1).
- **Email** — free-tier transactional email provider for the "notify customer" step.

**v2:** Slack, Discord, Google Sheets, Microsoft Teams, Notion, full OAuth flows for each. All credentials — OAuth tokens or API keys — must be encrypted at rest using an application-level `CREDENTIAL_ENCRYPTION_KEY`, never sent to the frontend, never logged, never included in an AI prompt. An expired token surfaces as `AUTH_EXPIRED`, not a generic 500.

---

## Execution Engine

Execution status: `PENDING | RUNNING | AWAITING_APPROVAL | COMPLETED | FAILED | RETRYING | CANCELLED`.

Every execution stores an **immutable workflow snapshot** at runtime — editing the workflow later never changes historical execution records.

### Background Jobs (v1 simplification)
Full BullMQ + Redis queueing is listed as v2 if the free Upstash/TCP fit is awkward. For v1, retries can run **synchronously within the request/execution lifecycle** using in-process exponential backoff (a simple timer-based retry helper is sufficient for a single-instance deployment at demo scale). Document this clearly as a deliberate v1 simplification, not an oversight — reviewers respect an explicit tradeoff more than an accidental gap.

Retry strategy (same in both v1 and v2): Attempt 1 → 5s → Attempt 2 → 30s → Attempt 3 → 5min → Human Escalation. Max retries configurable per node.

---

## Real-Time Layer

Socket.IO streams agent events (planner, decision, execution, validation, recovery, monitoring) per execution to subscribed clients, rendered as a live timeline without page refresh. Approval Queue updates (new item, resolved item) also broadcast in real time.

---

## Notifications

Generated for: workflow completed, workflow failed, approval required, integration expired, workflow paused, recovery escalation, high-risk action. Users can view, mark as read, and filter.

---

## Database Schema

### Users
```text
id, name, email, passwordHash, role, canApprove, createdAt, updatedAt, lastLogin
```

### Workflows
```text
id, name, description, sourceSopText, ownerId, status, version, triggerConfig, nodes, edges, variables, approvalRules, tags, createdAt, updatedAt
```

### WorkflowVersions
```text
id, workflowId, version, snapshot, createdBy, createdAt
```

### Executions
```text
id, workflowId, workflowVersion, workflowSnapshot, status, currentNode, inputs, outputs, error, retryCount, aiCallCount, startedAt, completedAt, duration, triggerType, createdAt
```

### ExecutionLogs
```text
id, executionId, workflowId, nodeId, agent (planner|decision|execution|validation|recovery|monitoring), level (info|warning|error|success), message, reasoningTrace, confidenceScore, metadata, timestamp
```

### Approvals
```text
id, executionId, workflowId, nodeId, requestedBy, approvedBy, status (PENDING|APPROVED|REJECTED|EXPIRED), triggerReason (THRESHOLD|LOW_CONFIDENCE), reason, metadata, createdAt, resolvedAt
```

### Integrations (v2)
```text
id, ownerId, provider, status, encryptedAccessToken, encryptedRefreshToken, scopes, expiresAt, createdAt, updatedAt
```

### KnowledgeDocuments / KnowledgeChunks (v2, RAG only)
```text
KnowledgeDocuments: id, ownerId, name, sourceType, sourceUrl, content, metadata, createdAt
KnowledgeChunks: id, documentId, content, embedding, metadata, createdAt
```

### Notifications
```text
id, ownerId, workflowId, executionId, type, title, message, isRead, createdAt
```

### AgentMemory — cut from v1 unless you define its use now
The original spec included this table with no consumer. If you keep it, give it one concrete job for v1, e.g.: *"the Decision Agent looks up the 3 most recent prior decisions for this workflow + node before deciding, to keep similar cases consistent over time."* If you don't have time to wire that up, remove the table entirely rather than shipping an unused schema — an empty table is a flag in review, not a feature.
```text
id, executionId, workflowId, agentId, key, value, confidenceScore, createdAt
```

---

## API Endpoints

### Health & Auth
```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Workflows
```text
GET    /api/workflows
POST   /api/workflows
GET    /api/workflows/:id
PUT    /api/workflows/:id
DELETE /api/workflows/:id
POST   /api/workflows/generate
POST   /api/workflows/:id/simulate
POST   /api/workflows/:id/execute
POST   /api/workflows/:id/duplicate
GET    /api/workflows/:id/versions
POST   /api/workflows/:id/activate
```

### Executions
```text
GET  /api/executions
GET  /api/executions/:id
GET  /api/executions/:id/timeline
POST /api/executions/:id/cancel
POST /api/executions/:id/retry
```

### Approvals
```text
GET  /api/approvals
GET  /api/approvals/:id
POST /api/approvals/:id/approve
POST /api/approvals/:id/reject
POST /api/approvals/:id/edit-approve
```

### Notifications
```text
GET  /api/notifications
POST /api/notifications/:id/read
POST /api/notifications/read-all
```

### v2 endpoints (knowledge/RAG, integrations OAuth) — see the original draft; add only once v1 is deployed and stable.

---

## Frontend Pages (v1)

- `/` — landing page: product explanation, example workflow, CTA.
- `/login`, `/register`
- `/dashboard` — workflow count, active runs, pending approvals, success/failure rate, recent activity.
- `/workflows` — library: search, filter, sort, create, duplicate, archive, activate.
- `/workflows/new` — natural-language input → **Generate Workflow**.
- `/workflows/:id` — canvas editor: node palette (8 v1 node types) | canvas | config panel.
- `/workflows/:id/simulation` — input editor, graph, execution steps, mocked external actions, result.
- `/executions`, `/executions/:id` — history + full timeline detail (snapshot, inputs/outputs, agent events, retries, approvals).
- `/approvals` — approval inbox: workflow, request, risk level, data, AI reasoning + confidence, trigger reason (threshold vs. low-confidence), Approve/Reject/Edit-and-Approve.
- `/settings` — profile, security, notification preferences.

**v2 pages:** `/knowledge` (RAG document management), `/integrations` (OAuth), `/analytics`.

---

## Backend Architecture

```text
server/src/
├── config/        (env, database, redis, socket)
├── middleware/    (auth, role, errorHandler, rateLimiter, validation)
├── routes/
├── controllers/
├── services/      (auth, workflow, execution, simulation, approval, aiService, notification, credentialService)
├── agents/        (orchestrator, plannerAgent, decisionAgent, executionAgent, validationAgent, recoveryAgent, monitoringAgent)
├── workflow/      (workflowEngine, nodeExecutor, conditionEngine, rulesEngine, workflowValidator, workflowGenerator)
├── integrations/  (baseIntegration, emailIntegration, httpIntegration, databaseIntegration)
├── queues/        (executionQueue — v1: in-process retry helper; v2: BullMQ)
├── models/
└── utils/         (encryption, logger, errors, retry, aiProviderRouter [Gemini→Groq→deterministic fallback])
```

## Frontend Structure

```text
client/src/
├── components/    (AppShell, Dashboard, WorkflowCanvas, NodePalette, NodeConfigPanel,
│                   WorkflowGenerator, SimulationPanel, ExecutionTimeline, ApprovalCard,
│                   NotificationDrawer, ProtectedRoute)
├── pages/
├── store/         (authStore, workflowStore, executionStore, notificationStore)
├── services/      (api, socket)
└── types/
```

---

## Security Requirements

- Hash passwords with bcrypt (cost 12); never store plaintext.
- Protect all private endpoints; validate every request body (Zod/express-validator).
- Rate-limit auth endpoints; Helmet security headers; CORS restricted to `CLIENT_URL`.
- Encrypt any stored credentials/API keys at rest; never expose to the browser; never log tokens.
- Validate AI-generated workflow JSON against a strict schema before persisting.
- Enforce workflow ownership and approval permissions server-side, not just in the UI.
- Simulation mode must be structurally incapable of performing real destructive actions (mock the integration layer itself in simulation mode, don't just "ask nicely" not to call it).
- Execution timeouts and retry limits enforced per node.
- Enforce the per-execution AI-call budget server-side.
- Record security-sensitive actions (approval decisions, credential changes) in the audit log.

## AI Safety / Control Requirements

```text
AI Recommendation → Schema Validation → Permission Check → Business Rule Check
                  → Human Approval if Required → External Action
```
AI output never directly executes arbitrary server-side code. External actions only use explicitly registered integrations and permitted operations.

---

## Testing Requirements

- **Unit:** auth, workflow schema validation, rules engine, condition engine, retry/backoff logic, AI output validation, permission checks, approval-rule evaluation (both trigger conditions).
- **Integration:** workflow creation → generation → execution, approval pause/resume, database persistence, AI provider fallback chain (mock Gemini failure → confirm Groq is called → confirm deterministic fallback if both fail).
- **Eval set:** 10–15 hand-written SOPs (start small — quality over quantity) with expected compiled-graph structure, run as a repeatable regression suite to measure compiler accuracy, not a one-off manual check.
- **E2E (Playwright):** Register → Login → Create/Generate Workflow → Edit → Simulate → Execute → Human Approval → Resume → Complete → View Audit Timeline.
- **CI:** GitHub Actions — lint + unit + integration tests on every PR; deploy to Render/Vercel on merge to `main`.

---

## Development Phases

1. **Foundation** — Next.js, Express, Postgres (Supabase/Neon), Prisma, auth, protected routes, AppShell, dashboard.
2. **Workflow Engine** — CRUD, React Flow canvas, 8 v1 node types, config panel, persistence, conditions, basic sequential executor.
3. **AI Workflow Generator** — Gemini primary, Groq fallback, deterministic final fallback, Zod schema validation, prompt-to-workflow.
4. **Agentic Execution** — LangGraph, all 6 agents, AI-call budget enforcement, retry/backoff.
5. **Simulation + Human Approval** — simulation engine with mocked integrations, explicit approval-trigger rule, approval inbox, pause/resume.
6. **Refund Demo Hardening** — seed mock order/customer data, wire the full refund SOP end-to-end, write the eval set, write E2E tests.
7. **Deploy** — Vercel (frontend), Render (backend), Supabase/Neon (DB), GitHub Actions CI. Ship v1.
8. *(If time remains)* **v2** — RAG tied to the refund-policy step, second/third SOP type, BullMQ, remaining node types, analytics.

---

## UI/UX Requirements

Modern AI operations console, not a generic admin dashboard: clean dark/light theme, responsive, skeleton loading, empty/error states, toast notifications, animated workflow nodes and execution states, real-time timeline, approval cards with clear risk indicators. The workflow canvas is the visual centerpiece.

---

## Final Expected Outcome

An authenticated operator enters a business process in plain English, watches it compile into a structured workflow, reviews and edits it, simulates it safely, activates it, triggers a real execution, watches AI agents execute steps within deterministic business-rule boundaries, sees the run pause for human approval exactly when the declared rule says it should, resumes after a decision, and can inspect a complete, trustworthy audit trail of everything that happened — all running on a stack that costs nothing to operate at demo scale.

**Core product principle, restated:** AI decides within boundaries. The workflow engine controls execution. Humans remain in control of high-risk actions.