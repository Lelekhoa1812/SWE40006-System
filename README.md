# Medical Messenger - SWE40006

A modest, privacy-aware **medical messenger** that allows **patients** to discover and **subscribe to doctors** (by role/specialty) and view a **basic doctor directory**. This MVP implements the **frontend UI**, a **typed backend API** serving **mock data**, strict **repo quality gates**, and CI scaffolding—providing a disciplined runway for the next 70% (auth, subscriptions persistence, real-time chat, privacy workflows, and Azure deployment).

> **Status:** `v0.1.0-mvp30` — UI ↔ API integrated with mock data, no real database writes yet.

---

## Table of Contents

- [Goals](#goals)
- [Feature Scope](#feature-scope)
- [Architecture Overview](#architecture-overview)
- [Directory Layout](#directory-layout)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Develop & Run](#develop--run)
- [Testing & Quality](#testing--quality)
- [CI/CD Overview](#cicd-overview)
- [Observability](#observability)
- [Infrastructure (Preview)](#infrastructure-preview)
- [Security & Privacy](#security--privacy)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Goals

- Deliver a clean **MVP foundation** with strict **quality gates** and consistent **monorepo** practices.
- Keep the app **simple** while preserving essential **doctor discovery** and **typed API contracts**.
- Prepare a seamless path to **Azure App Service** deployment with **Key Vault** and **Application Insights** (not enabled in MVP).

---

## Feature Scope

### Implemented

- **Doctor Directory UI** (search box + specialty filter, client-side filtering).
- **Backend API** (Fastify) serving **mock doctors** from `/database`.
- **Strict types & schemas** (zod) shared across packages.
- **Repo discipline**: ESLint, Prettier, TypeScript strict, vitest, Husky, Commitlint.
- **CI scaffolding**: build/test/lint/typecheck; infra syntax check (Bicep build).

### Not Yet (planned)

- Authentication & authorization.
- Subscription request/approval persistence.
- Real-time 1:1 chat (Socket.IO).
- Production database (MongoDB Atlas).
- Azure App Service deployment, Key Vault, Application Insights.

> In MVP, data is served from **mock JSON**; the **types/schemas** are shared between frontend and backend to guarantee contracts.

---

## Directory Layout

```
.
├── frontend/          # Next.js (TypeScript, App Router), Tailwind, shadcn/ui
├── backend/           # Fastify (TypeScript), REST APIs, zod validation, pino
├── database/          # Shared zod types + mocks (doctors/users), seeds later
├── infra/             # Bicep skeletons (App Service, Insights modules - preview)
├── docs/              # ADRs, env policy, PR checklist, smoke tests, roadmap
├── .github/           # CI workflows, templates
├── pnpm-workspace.yaml
├── package.json       # Workspace scripts & tooling
└── README.md          # This file
```

---

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, TailwindCSS, shadcn/ui, Testing Library + Vitest
- **Backend**: Fastify (TypeScript), zod (schemas), pino (logging), vitest
- **Tooling**: PNPM workspaces, ESLint, Prettier, Husky, Commitlint (Conventional Commits)
- **Infra (preview)**: Bicep skeletons; Azure App Service & App Insights planned
- **CI**: GitHub Actions (build, lint, test, typecheck, infra syntax)

---

## Getting Started

### Prerequisites

- **Node.js 20.x** (`.nvmrc` included)
- **PNPM** ≥ 8 (`corepack enable` recommended)
- Git + a terminal (macOS/Linux/WSL or Windows)

### Install

```bash
# at project root
pnpm install
pnpm prepare   # sets up Husky hooks
```

> If PNPM is missing: `corepack enable && corepack prepare pnpm@latest --activate`

---

## Environment Variables

Create `.env` files from the provided samples.

**`/frontend/.env.local`**

```
NEXT_PUBLIC_API_BASE_URL=https://medmsg-blue.azurewebsites.net
```

**`/backend/.env`**

```
PORT=4000
LOG_LEVEL=info
# MONGODB_URI=  # (not required in MVP; planned for next phase)
```

> MVP uses **mock JSON** instead of a real database. Env validation (zod) will **fail fast** if required vars are missing.

---

## Develop & Run

In **two terminals**:

```bash
# Terminal 1: backend
cd backend
pnpm dev
# Fastify on https://medmsg-blue.azurewebsites.net
# Try: curl https://medmsg-blue.azurewebsites.net/health
```

```bash
# Terminal 2: frontend
cd frontend
pnpm dev
# Next.js on https://medmsg-frontend-static.azurewebsites.net
# Visit /doctors to see directory
```

---

## Testing & Quality

Run at project root:

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm -r test
```

- **Husky** enforces lint-staged on commit and **Commitlint** on commit messages.
- **Vitest** runs per package; shared **zod** types ensure DTO parity.

---

## CI/CD Overview

GitHub Actions (at minimum):

- **Build & Test**: `frontend` and `backend` (cache PNPM).
- **Typecheck**: strict TS across workspaces.
- **Infra syntax**: `az bicep build` (syntax only).
- **Smoke**: run backend build artifact and `curl /health` (expected `200`).

> **Branch protection** (recommended): require CI green + code review + Conventional Commit.

---

## Observability

MVP includes:

- **pino** structured logging in backend.
- Placeholder **web vitals** capture in frontend (console).

Planned:

- **Azure Application Insights** (server + browser) with dashboards & alerts.

---

## Infrastructure (Preview)

Bicep skeletons live in `/infra`:

- `main.bicep` + `modules/` (App Service, Insights—placeholders).
- CI job performs **syntax check only** (no deploy in MVP).

> Deployment, Key Vault references, and App Service **WebSockets** settings are part of the next increment.

---

## Security & Privacy

- **Passwords** (future auth) must be **hashed** (e.g., bcrypt/Argon2), never stored in plaintext.
- **Transport** via HTTPS/TLS.
- **Secrets** belong in environment variables and (in cloud) **Key Vault**—**never** in the repo.
- Treat all future chat content as **health information**; implement clear **consent** and **access control** when enabling subscriptions and messaging.

---

## Roadmap

- **Auth** (email/password or external IdP), role-based routes.
- **Subscriptions**: request/approve/deny, persisted in DB.
- **Real-time chat**: Socket.IO with delivery/read states.
- **MongoDB Atlas** integration, seed scripts, indices.
- **Azure**: App Service (Linux), Key Vault references, Application Insights, deployment slots (staging→prod).
- **Privacy UX**: consent flows, retention policy, audit log.

---

## Contributing

- **Conventional Commits** (e.g., `feat:`, `fix:`, `chore:`).
- Keep PRs **small** and **focused**; update `/docs` with any behavior or API change.
- Run `pnpm lint && pnpm -r test && pnpm typecheck` before pushing.

See: `/docs/CONTRIBUTING.md`, `/docs/PR-checklist.md`, `/docs/definition-of-done.md`.

---

## License

MIT License.
