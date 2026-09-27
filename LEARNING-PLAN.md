# Agentflow_AI — Learning Roadmap

Rules of the road:
- One milestone at a time. Don't start the next until the **Gate** passes.
- Each milestone = **Learn** (concepts first) → **Build** (tasks) → **Done when** (proof it works) → **Gate** (quiz).
- To get quizzed: say `quiz M3`. To get a concept taught: say `teach me <concept>`. To get your code reviewed: `/mentor review <file>`.
- Tick boxes as you go. Gate answers go in chat; `notes/` only keeps a 2-line pass/deferred summary per milestone.

---

## Decisions (locked 2026-09-27)

- [x] **TypeScript** on client and server. Spec's `.js` file names become `.ts` / `.tsx`.
- [x] **Monorepo:** `client/` (Next.js) + `server/` (Express) in this repo. Spec's folder-structure section got mangled when pasted (line 130-137), so we define it ourselves in M1/M4.
- [x] **Docker** for local MongoDB + Redis.
- [x] **v1 = Discord only.** Slack, Google Sheets, Gmail move to v2 (after M15).

---

## Big picture — read this first

What the app does, in one line: **prompt → graph → run graph step by step → show each step live → save everything.**

The "agents" in this spec are mostly **not** AI. Only workflow generation (and AI nodes inside a workflow) call an LLM. The rest are plain modules with clear jobs:

| "Agent" | What it really is |
|---|---|
| Planner | Sort the graph into run order (topological sort) + a confidence score |
| Execution | Look at the node type, call the right integration/LLM |
| Validation | Check the node's output has the required fields |
| Recovery | Look at an error, label it, decide: retry or give up |
| Monitoring | Write a log row + push an event to the browser |

This matters: you'll build the chain **by hand first** (M9), then learn LangGraph and port it (M10). That way you understand what LangGraph gives you instead of treating it as magic.

---

## M0 — Foundations

**Learn**
- [x] HTTP: methods, status codes, headers, request/response body
- [x] REST: resources, URLs, which method for which action
- [x] JSON, async/await, Promises, try/catch with async
- [x] Environment variables and `.env` files (why secrets never go in git)
- [x] npm: `package.json`, scripts, dependencies vs devDependencies
- [x] Docker basics: image, container, `docker compose up`
- [x] TypeScript basics: types, `interface` vs `type`, unions, generics, `unknown`, `tsconfig.json`, running TS in Node (`tsx`)

**Build**
- [x] `docker-compose.yml` running MongoDB + Redis locally
- [ ] Root `.gitignore` (`node_modules`, `.env`, `dist`) + `.env.example` — moved to M1, before first `npm install` in server
- [x] `client/` and `server/` folders created

**Done when:** `docker compose up` runs both, you can connect with `mongosh` and `redis-cli ping` returns PONG.

**Gate:** What's the difference between 401 and 403? Why is PUT idempotent but POST isn't? What happens if you `await` inside a `forEach`?

---

## M1 — Express server skeleton

**Learn**
- [ ] Express: app, router, middleware chain, `next()`, error middleware (4 args)
- [ ] Layered architecture: routes → controllers → services → models (spec line 52). Why controllers never touch Mongo.
- [ ] helmet, cors, morgan, compression — what each one does
- [ ] Validating env vars at startup (fail fast if `JWT_SECRET` missing)

**Build**
- [ ] `server/src/config/env.ts` — load + validate env
- [ ] `server/src/app.ts` with helmet, cors (only `CLIENT_URL`), morgan, compression, JSON body parser
- [ ] Central error handler + one error class with `code` and `status`
- [ ] `GET /api/health` → uptime, status, env name

**Done when:** `curl localhost:4000/api/health` returns JSON; unknown route returns clean 404 JSON; server refuses to boot with a missing required env var.

**Gate:** Order of middleware — why does the error handler go last? What does helmet actually set? What's the job of a controller vs a service?

---

## M2 — MongoDB + Mongoose

**Learn**
- [ ] Documents vs rows, collections, `_id`, ObjectId
- [ ] Mongoose: schema, model, validators, `timestamps`, `ref` + `populate`, indexes
- [ ] `select: false` (hides password by default)
- [ ] `mongodb-memory-server` for the in-memory fallback + tests

**Build**
- [ ] `config/db.ts` — connect to `MONGO_URI`, fall back to in-memory if not set
- [ ] `User` model: name, email (unique, lowercase), password (`select: false`), role (`admin|operator`), lastLoginAt

**Done when:** you can create a user in a script, and `User.findOne()` does NOT return the password unless you ask with `.select('+password')`.

**Gate:** When would you embed vs reference? What does a unique index protect you from that app code can't? What's `populate` doing under the hood?

---

## M3 — Authentication

**Learn**
- [ ] Hashing vs encryption. Why bcrypt, what "cost 12" means, what a salt is
- [ ] JWT: header/payload/signature, what's safe to put in the payload, expiry
- [ ] Auth middleware: read `Authorization: Bearer`, verify, attach `req.user`
- [ ] Role check middleware (admin vs operator)
- [ ] express-validator, express-rate-limit
- [ ] Testing APIs with Jest/Vitest + supertest

**Build**
- [ ] `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- [ ] `requireAuth`, `requireRole` middleware
- [ ] Rate limit on auth routes
- [ ] Tests: register, duplicate email, wrong password, `/me` with/without token

**Done when:** all auth tests pass; login with wrong password and wrong email return the SAME error message.

**Gate:** Why same error for wrong email vs wrong password? Can you "log out" a JWT server-side? Where should the client store the token and what's the risk of each option?

---

## M4 — Next.js frontend skeleton

**Learn**
- [ ] Next.js Pages Router: file-based routes, `_app.tsx`, dynamic routes `[id].tsx`
- [ ] React 19 basics you need: state, effects, props, controlled forms
- [ ] Tailwind: utility classes, dark mode
- [ ] Zustand: store, selectors, `persist` middleware
- [ ] Axios instance + interceptors (attach token, handle 401 globally)

**Build**
- [ ] `lib/api.ts` (Axios + interceptors), `store/authStore.ts` (persisted)
- [ ] `/login`, `/register` with validation, loading, error states
- [ ] Route guard: protected pages redirect to `/login`
- [ ] `/` redirects based on auth state
- [ ] `AppShell` layout (sidebar + header)

**Done when:** register → land on dashboard → refresh page → still logged in → token expires → bounced to login.

**Gate:** Why does persisted Zustand state cause a "flash" on first render, and how do you fix it? What does an Axios response interceptor let you avoid repeating?

---

## M5 — Workflow data model + CRUD

**Learn**
- [ ] Graphs: node, edge, directed, DAG, cycle — this is the heart of the whole app
- [ ] React Flow's node/edge shape (`id`, `type`, `position`, `data`; `source`, `target`) — store exactly this shape in Mongo
- [ ] Ownership checks (user A must never read user B's workflow)
- [ ] Pagination, filtering, sorting in Mongo
- [ ] Aggregation pipeline (`$match`, `$group`) for dashboard metrics

**Build**
- [ ] `Workflow` model: name, description, owner, status, trigger, nodes, edges, tags, version, lastExecutedAt
- [ ] All `/api/workflows` routes except `generate` and `execute`
- [ ] Version bump on update; duplicate resets version to 1
- [ ] Graph validation: no cycles, edges point to real nodes, exactly one trigger
- [ ] `GET /api/workflows/dashboard` metrics

**Done when:** tests prove user B gets 404 on user A's workflow, and a workflow with a cycle is rejected.

**Gate:** How do you detect a cycle? Why return 404 (not 403) for someone else's workflow? What's the risk of storing `version` without checking it on update?

---

## M6 — React Flow canvas

**Learn**
- [ ] React Flow: `ReactFlow`, `useNodesState`/`useEdgesState`, `onConnect`, custom node types, animated edges
- [ ] HTML5 drag and drop (palette → canvas), `screenToFlowPosition`
- [ ] Controlled vs uncontrolled state; where graph state lives (Zustand `workflowStore`)

**Build**
- [ ] `lib/nodeCatalog.ts` — node types grouped: triggers, actions, AI, logic. Each with its config fields (revisit `satisfies`, deferred from M0)
- [ ] `/workflows/[id]`: palette (left), canvas (center), config panel (right)
- [ ] Select node → edit its config → save → reload shows the same graph
- [ ] `/dashboard` with `MetricGrid` and workflow list

**Done when:** you can build a 3-node workflow by dragging, configure each node, save, refresh, and it's identical.

**Gate:** Why drive the config panel from the node catalog instead of hardcoding forms per node? What breaks if node IDs aren't unique?

---

## M7 — LLMs + AI workflow generation

**Learn**
- [ ] What an LLM API call is: messages (system/user/assistant), tokens, temperature, cost
- [ ] Prompt design for **structured output**: ask for JSON matching a shape, give examples
- [ ] Never trust LLM output: parse + validate with a schema (Zod), retry or fall back on failure
- [ ] OpenRouter (one API, many models, OpenAI-compatible format) vs Gemini SDK
- [ ] Fallback chain pattern: provider A → provider B → rule-based

**Build**
- [ ] Deterministic rule-based builder FIRST (keyword match → template graph for: send email, invoice routing, Slack/Discord notify, sheet append)
- [ ] OpenRouter generator → validate → fall back to Gemini → fall back to rules
- [ ] `POST /api/workflows/generate`
- [ ] `/workflows/builder`: `PromptInputPanel`, `GraphPreviewPanel`, `WorkflowCanvas`, `WorkflowToolbar`

**Done when:** with NO API keys set, "send an email when a row is added to a sheet" still produces a valid graph. With keys, the LLM version passes the same validation.

**Gate:** Why build the rule-based one first? What do you do if the LLM returns a node type that isn't in your catalog? Why low temperature here?

---

## M8 — Execution engine (no agents yet)

**Learn**
- [ ] State machines: PENDING → RUNNING → COMPLETED/FAILED, plus RETRYING, PAUSED, CANCELLED. Draw the allowed transitions.
- [ ] Topological sort (Kahn's algorithm) — the run order of the graph
- [ ] Snapshots: why an execution stores a frozen copy of the workflow
- [ ] How pause/cancel work: a flag the runner checks between nodes

**Build**
- [ ] `Execution` and `ExecutionLog` models
- [ ] Runner: sort nodes, run each with **mock handlers** (fake email, fake Slack), pass output to next node
- [ ] `POST /api/workflows/:id/execute`, `GET /api/executions`, `/:id`, `/:id/timeline`
- [ ] pause / resume / cancel endpoints — reject invalid transitions (can't resume a COMPLETED run)

**Done when:** executing a workflow creates an Execution + one log row per node, and cancelling mid-run stops before the next node.

**Gate:** Why snapshot instead of referencing the live workflow? Where in the loop does the runner check for pause? What happens to a node that's mid-call when you cancel?

---

## M9 — Agents, built by hand

**Learn**
- [ ] What "agent" means in general (LLM + tools + loop) vs what it means here (specialized step in a pipeline)
- [ ] Shared state passed between agents
- [ ] Error classification: MISSING_FIELDS, API_FAILURE, AUTH_EXPIRED, RATE_LIMIT, TRANSIENT — which are retryable?
- [ ] Retry with exponential backoff + jitter
- [ ] AgentMemory: what's worth remembering across runs

**Build**
- [ ] Refactor M8's runner into: planner, execution, validation, recovery, monitoring, orchestrator — plain functions (revisit `never` exhaustive check on agent events, deferred from M0)
- [ ] Planner emits order + confidence score
- [ ] Recovery decides `retry_with_backoff` vs `escalate`
- [ ] Monitoring writes every event to `ExecutionLog`
- [ ] Unit test each agent in isolation

**Done when:** a mock node that fails twice with TRANSIENT then succeeds shows retry events in the timeline; AUTH_EXPIRED escalates immediately.

**Gate:** Why is RATE_LIMIT retryable but MISSING_FIELDS not? Why jitter? What does the orchestrator own that no single agent owns?

---

## M10 — LangChain + LangGraph

**Learn**
- [ ] **LangChain** = building blocks for LLM apps: chat models, prompt templates, output parsers, tools. Think "nice wrapper around LLM calls".
- [ ] **LangGraph** = run a workflow as a graph of steps over shared state. Concepts: `StateGraph`, state schema, nodes, edges, **conditional edges**, checkpointer (save/resume).
- [ ] Map it: your M9 agents = LangGraph nodes; recovery's retry/escalate = conditional edge; pause/resume = checkpointer
- [ ] Dynamic `import()` in try/catch to detect if a package is installed

**Build**
- [ ] Tiny standalone LangGraph toy first (3 nodes, one conditional edge) in a scratch file
- [ ] Port the M9 orchestrator to a `StateGraph`
- [ ] Orchestrator reports `langGraph: 'available' | 'not-installed'` and falls back to the hand-rolled chain
- [ ] Optional: use LangChain for the M7 generator (prompt template + structured output parser)

**Done when:** same test workflow gives the same timeline with LangGraph installed and uninstalled.

**Gate:** What does LangGraph give you that your hand-rolled loop didn't? When is LangChain overkill? How does a conditional edge replace an `if` in your orchestrator?

---

## M11 — Real-time with Socket.IO

**Learn**
- [ ] HTTP polling vs WebSockets; what Socket.IO adds (rooms, reconnect, fallbacks)
- [ ] Rooms: one room per execution, client joins `execution:<id>`
- [ ] Authenticating the socket handshake with the JWT
- [ ] Notifications: persist first, then push

**Build**
- [ ] `config/socket.ts`, `lib/socket.ts`
- [ ] Monitoring agent emits every event to the execution's room
- [ ] Live timeline with color-coded agent badges
- [ ] `Notification` model, `GET /api/notifications`, drawer in `AppShell`
- [ ] `/executions` list with live status updates

**Done when:** open two tabs, run a workflow in one, watch the timeline fill live in the other.

**Gate:** What happens to events emitted before the client joins the room — how do you avoid missing them? Why persist a notification before emitting it?

---

## M12 — Background queues with BullMQ

**Learn**
- [ ] Why background jobs: HTTP request shouldn't wait for a 30s workflow
- [ ] Redis basics (key-value, in-memory, what BullMQ stores there)
- [ ] BullMQ: Queue, Worker, Job, `attempts`, `backoff`, job events
- [ ] Fallback: in-memory queue when `REDIS_URL` not set — same interface

**Build**
- [ ] `/execute` now enqueues a job and returns the execution ID immediately
- [ ] Worker picks it up and runs the orchestrator
- [ ] Wire pause/cancel to the job
- [ ] In-memory fallback behind the same interface

**Done when:** kill the server mid-run with Redis on, restart, and the job continues or retries cleanly.

**Gate:** Recovery agent retries AND BullMQ retries — who owns what, so you don't retry 3x3=9 times? What's lost with the in-memory fallback?

---

## M13 — Integrations + OAuth

**Learn**
- [ ] OAuth 2.0 Authorization Code flow, step by step: start → provider consent → callback with code → exchange for tokens
- [ ] `state` parameter (CSRF protection), scopes, access vs refresh token, expiry
- [ ] Encryption at rest: AES-256-GCM with Node `crypto`, IV, auth tag. Why encrypt (not hash) tokens.
- [ ] One common interface (`baseIntegration.ts`) for all providers

**Build (in this order)**
- [ ] `Integration` model + encrypt/decrypt helpers (`CREDENTIAL_ENCRYPTION_KEY`)
- [ ] `baseIntegration` interface
- [ ] **Discord** via OAuth2 "add bot to server" flow (start + callback, store guild ID + encrypted tokens), then post messages with the bot token → swap the mock handler for real
- [ ] Auto-refresh expired Discord access tokens
- [ ] v2 (after M15): Slack → Google Sheets → Gmail, same `baseIntegration` interface
- [ ] `INTEGRATION_NOT_CONNECTED` / `AUTH_EXPIRED` show up in the timeline
- [ ] `/integrations` page: status, connect, reconnect, test, enable/disable

**Done when:** a Discord-notify workflow generated from a prompt actually posts a message, and disconnecting Discord makes the next run show `INTEGRATION_NOT_CONNECTED` in the timeline.

**Gate:** Walk through OAuth code flow from memory. What attack does `state` stop? Why must the IV be random per encryption? Where could a decrypted token accidentally leak?

---

## M14 — Remaining pages + polish

- [ ] `/settings`: profile, role, API-key status, encryption-key health, logout
- [ ] `/` landing page
- [ ] Skeleton loaders, empty states, responsive checks, dark theme
- [ ] Retry execution from `/executions` and the editor

**Done when:** every page in the spec works on a phone-width screen.

---

## M15 — Hardening + ship

**Learn**
- [ ] Security checklist (spec line 155) — go through each line
- [ ] Test coverage, what's worth testing
- [ ] Playwright E2E for the ONE critical flow
- [ ] Deploy: frontend (Vercel), backend (Render/Railway/Fly), Mongo Atlas, Upstash Redis

**Build**
- [ ] Grep logs for any token leak
- [ ] Coverage ≥ 80% on server services + agents
- [ ] E2E: register → generate workflow → save → execute → see timeline complete
- [ ] Deploy

**Done when:** the spec's "Final Expected Outcome" (line 158) works on the deployed URL.

---

## Progress

| Milestone | Status |
|---|---|
| M0 Foundations | done |
| M1 Express | ☐ |
| M2 Mongo | ☐ |
| M3 Auth | ☐ |
| M4 Next.js | ☐ |
| M5 Workflow CRUD | ☐ |
| M6 Canvas | ☐ |
| M7 AI generation | ☐ |
| M8 Execution engine | ☐ |
| M9 Agents by hand | ☐ |
| M10 LangGraph | ☐ |
| M11 Real-time | ☐ |
| M12 Queues | ☐ |
| M13 Integrations | ☐ |
| M14 Pages + polish | ☐ |
| M15 Ship | ☐ |
