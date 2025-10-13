# Environment & Secrets Policy

## Principles

- No secrets in the repository.
- Use `.env.sample` to document required variables.
- Validate env variables at runtime and fail fast.
- Rotate secrets regularly and on role changes.

## Frontend

- Public variables must be prefixed with `NEXT_PUBLIC_`.
- Required: `NEXT_PUBLIC_API_BASE_URL` (URL of backend).

## Backend

- Required: `PORT`, `LOG_LEVEL`.
- Optional: `MONGODB_URI` (future use).

## Samples

- Keep `.env.sample` files in each package up to date.
- Do not include real values. Use placeholders.

## Rotation

- Rotate secrets on team changes or suspected compromise.
- Update deployment environment variables and invalidate old credentials.
