# CI/CD Excellence in This Project

This repository is intentionally designed to support fast, reliable, and safe delivery through strong CI/CD principles, rigorous automation, and test discipline.

## Core Principles

- Shift-left validation: run lint, typecheck, tests before code is merged.
- Small, focused commits and PRs with Conventional Commits for traceability.
- Reproducible builds via PNPM workspaces, strict TypeScript, and pinned tooling.
- Security and secrecy discipline: env validation, no secrets in repo, `.env.sample` only.
- Progressive infra-as-code with syntax validation in CI.

## What CI/CD Automates Here

- Linting (ESLint) and formatting (Prettier) via lint-staged + Husky on commit.
- Type-safety gate with strict TypeScript across workspaces.
- Unit tests with Vitest for backend and frontend components.
- Commit message checks (Commitlint) to enforce Conventional Commits.
- Infra syntax checks: `az bicep build` on PRs touching `infra/**`.
- Smoke tests: automated health checks on backend builds.
- Observability: structured logging and web vitals placeholders.

## Why This Is Optimal

- Predictable main branch: pre-commit hooks stop common defects at the source.
- Fast feedback: Vitest and ESLint run quickly, enabling rapid iteration.
- Clear ownership: CODEOWNERS routes reviews to domain experts.
- Consistency: shared config (Prettier, TS) avoids drift between packages.
- Contract safety: zod validation ensures API/env contracts at runtime.

## Pipelines and Workflows

- `infra-lint` GitHub Action validates Bicep templates on push/PR (syntax only) to prevent broken infra changes.
- `smoke-test` GitHub Action runs health checks on backend builds to ensure deployability.
- Future extension points: add build/test matrices per workspace and preview deployments.

## Deployment Readiness

- Infra skeleton (Bicep) establishes parameters for location, plan SKU, app name—ready for what-if and staged rollouts.
- Blue-green deployment strategy documented with Azure CLI commands.
- App Service WebSockets note included for future realtime features.
- Clean separation of concerns: `/frontend`, `/backend`, `/infra` with minimal coupling.

## Testing Strategy

- Backend: route unit tests (health, doctors) with fast in-memory Fastify injection.
- Frontend: component tests (e.g., DoctorCard) and page behavior tests (filtering) with Testing Library + JSDOM.
- Deterministic mocks: `/database/mocks` seeded data for stable UI/API tests.

## Quality Gates

- ESLint configs tuned per package (React, a11y, TS) – blocks anti-patterns early.
- TypeScript strict mode – catches unsafe code at compile time.
- Prettier – consistent style for low-diff, easy reviews.
- Commitlint – enforces semantic history for clean changelogs and automation.

## Secrets & Environments

- `docs/env-policy.md` documents rules: no secrets in repo, rotation policy, `.env.sample` usage.
- `src/env.ts` (frontend/backend) validates runtime env and fails fast to avoid undefined behavior.

## Maintainability & Scale

- Monorepo with PNPM workspaces: shared tooling, isolated packages, single CI configuration.
- Modular infra with `modules/*` for incremental adoption without blocking app development.
- Conventional Commits + small PRs → easier reviews and safer releases.

## Observability & Monitoring

- Structured logging with Pino for request/response tracking and business logic events.
- Web vitals placeholders ready for Application Insights integration.
- Load testing script for performance baseline establishment.
- Health check endpoints for automated monitoring.

## Project Progress Summary

### Completed (Steps 1-7)

1. **API Integration**: Frontend wired to backend with loading/error states, filtering, and component tests.
2. **Environment Validation**: Zod-based validation for frontend/backend with fail-fast behavior.
3. **Repository Quality**: ESLint configs, PR checklist, definition of done, CODEOWNERS.
4. **Infrastructure Skeleton**: Bicep templates, parameters, CI syntax validation.
5. **Deployment Strategy**: Blue-green deployment documentation for Azure.
6. **Observability**: Request logging, web vitals, load testing, smoke tests.
7. **Documentation**: Comprehensive CI/CD principles and project progress tracking.

### Next Steps (Recommended)

- Add full CI pipelines: build, test, lint, typecheck for all packages on PRs.
- Add preview deployments (e.g., Vercel/Static Web Apps + Azure App Service staging).
- Add security scans (SAST/Dependabot/CodeQL) and license checks.
- Promote infra what-if to gated staged deployments with approvals.
- Integrate Application Insights for production observability.

This foundation emphasizes correctness and speed without sacrificing security or maintainability, enabling the team to scale delivery confidently.
