# Contributing Guidelines

## Branch Naming Convention

Use the following branch naming pattern:

```
<type>/<description>
```

### Types

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `style/` - Code style changes (formatting, etc.)
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks
- `ci/` - CI/CD changes
- `build/` - Build system changes

### Examples

- `feat/user-authentication`
- `fix/login-validation-bug`
- `docs/api-documentation`
- `refactor/database-queries`
- `test/user-service-tests`

## Pull Request Checklist

### Before Creating PR

- [ ] Branch follows naming convention
- [ ] All tests pass (`pnpm test`)
- [ ] Code is linted (`pnpm lint`)
- [ ] Code is formatted (`pnpm format`)
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] No console.log or debug statements left
- [ ] No secrets or sensitive data in code

### PR Description

- [ ] Clear title describing the change
- [ ] Description of what was changed and why
- [ ] Any breaking changes documented
- [ ] Screenshots for UI changes (if applicable)
- [ ] Testing instructions
- [ ] Related issues referenced

### Code Quality

- [ ] Single responsibility principle followed
- [ ] Functions are small and focused
- [ ] Meaningful variable and function names
- [ ] No code duplication
- [ ] Error handling implemented
- [ ] TypeScript types are explicit

### Testing

- [ ] Unit tests added for new functionality
- [ ] Existing tests still pass
- [ ] Edge cases covered
- [ ] Integration tests updated (if applicable)

### Documentation

- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Code comments added for complex logic
- [ ] Architecture decisions documented (if significant)

### Security

- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] SQL injection prevention (if applicable)
- [ ] XSS prevention (if applicable)
- [ ] Authentication/authorization handled properly

## Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Changes**
   - Write code following project standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Quality Checks**

   ```bash
   pnpm lint
   pnpm format
   pnpm test
   pnpm typecheck
   ```

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add user authentication system"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feat/your-feature-name
   ```

## Commit Message Format

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add JWT token validation
fix(api): resolve user creation endpoint error
docs(readme): update installation instructions
```

## Code Review Process

1. **Self Review**: Review your own code before requesting review
2. **Request Review**: Assign appropriate reviewers
3. **Address Feedback**: Make requested changes
4. **Final Approval**: Get approval from at least one reviewer
5. **Merge**: Merge after all checks pass

## Quality Gates

All code must pass these checks:

- ✅ ESLint (no errors or warnings)
- ✅ Prettier (code formatting)
- ✅ TypeScript (strict mode, no errors)
- ✅ Vitest (all tests pass)
- ✅ Commitlint (conventional commits)
- ✅ Pre-commit hooks (lint-staged)

## Getting Help

- Check existing documentation in `/docs`
- Review similar implementations in the codebase
- Ask questions in team channels
- Create issues for bugs or feature requests
