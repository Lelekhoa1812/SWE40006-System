# Documentation

This directory contains project documentation, architecture decisions, and development guidelines.

## Contents

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow and contribution guidelines
- Architecture Decision Records (ADRs)
- API documentation
- Deployment guides
- Development checklists

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
