# Documentation

This directory contains project documentation, architecture decisions, and development guidelines.

## Contents

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow and contribution guidelines
- [CICD.md](./CICD.md) - CI/CD practices and deployment strategies
- [deployment.md](./deployment.md) - Azure deployment guide
- [deployment-test.md](./deployment-test.md) - Deployment test results
- [auth.md](./auth.md) - Authentication and authorization documentation
- [privacy-consent.md](./privacy-consent.md) - Privacy consent policy
- [observability.md](./observability.md) - Logging and monitoring setup
- [env-policy.md](./env-policy.md) - Environment variable management
- [PR-checklist.md](./PR-checklist.md) - Pull request checklist
- [definition-of-done.md](./definition-of-done.md) - Definition of done criteria

## Development Workflow

1. Create feature branch following naming conventions
2. Implement changes with tests
3. Run quality gates (lint, format, test, typecheck)
4. Create pull request with checklist
5. Update documentation as needed

## Quality Standards

- All code must pass ESLint and Prettier
- TypeScript strict mode enabled
- Unit tests required for new features
- Conventional commit messages
- Pre-commit hooks enforce quality gates

## Current Status

- ✅ Authentication system implemented (bcrypt, sessions, role-based access)
- ✅ Doctor directory with filtering and pagination
- ✅ Subscription system with privacy consent
- ✅ MongoDB integration with proper schemas
- ✅ Azure deployment (blue-green strategy)
- ✅ CI/CD pipeline with quality gates
- 🔄 Real-time chat system (in progress)
- 🔄 Admin audit logging (planned)
- 🔄 Data validation and retention (planned)
