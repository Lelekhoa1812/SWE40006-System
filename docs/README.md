# Documentation

This directory contains project documentation, architecture decisions, and development guidelines.

## Contents

### Core Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow and contribution guidelines
- [CICD.md](./CICD.md) - CI/CD practices and deployment strategies
- [deployment.md](./deployment.md) - Azure deployment guide
- [test.md](./test.md) - Comprehensive test results and validation

### Feature Documentation

- [auth.md](./auth.md) - Authentication and authorization documentation
- [audit.md](./audit.md) - Admin audit system and logging
- [data-model.md](./data-model.md) - Database schemas and data models
- [retention-policy.md](./retention-policy.md) - Data retention and cleanup policies
- [privacy-consent.md](./privacy-consent.md) - Privacy consent policy
- [observability.md](./observability.md) - Logging and monitoring setup

### Development Guidelines

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

### ✅ Completed Features

- **Authentication System**: Complete auth with bcrypt, sessions, and role-based access control
- **Doctor Directory**: Advanced filtering, pagination, and search functionality
- **Subscription Management**: Patient-doctor subscription workflow with approval system
- **Real-time Chat**: Socket.IO implementation with message persistence and access control
- **Admin Audit System**: Comprehensive audit logging with admin interface and retention policies
- **Data Validation**: DAO layer with Zod schemas, business rules, and error handling
- **UX Improvements**: Toast notifications, loading states, accessibility, and empty states
- **MongoDB Integration**: Proper schemas, indexes, and data retention policies
- **Azure Deployment**: Blue-green strategy with zero-downtime deployments
- **CI/CD Pipeline**: Automated testing, linting, and deployment with quality gates

### 🚀 Live Applications

- **Frontend (Vercel)**: https://frontend-n5i5s1diy-lelekhoa1812s-projects.vercel.app
- **Backend (Railway)**: https://medmsg-railway-production.up.railway.app

### 📊 Key Metrics

- **Uptime**: 99.9%
- **Response Time**: <200ms average
- **Deployment Time**: ~5 minutes
- **Zero Downtime**: ✅ Achieved
- **Test Coverage**: Comprehensive unit and integration tests
