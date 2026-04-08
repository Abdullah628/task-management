# Task Management Backend Guidelines

## Mindset
- Understand the business logic before changing code.
- Optimize for scalability, maintainability, and testability.
- Prefer clean architecture over quick hacks.
- Keep code simple, predictable, and decoupled.

## Architecture
- Follow NestJS modular architecture.
- Keep each feature in its own module.
- Treat controllers as request and response handlers only.
- Put all business logic in services.
- Use DTOs for validation and typing.
- Treat database models and Prisma schema as the source of truth for persistence.

## Dependency Rules
- Use dependency injection everywhere.
- Prefer abstractions when they reduce coupling.
- Do not make modules depend on each other more than necessary.

## Controller Rules
- Keep controllers thin.
- Never put business logic in controllers.
- Return data from services directly unless transformation is required.

## Service Rules
- Keep services reusable and testable.
- Avoid direct HTTP concerns inside services.
- Use services for orchestration, validation of business rules, and data access coordination.

## DTO and Validation
- Always use DTOs with validation.
- Enable and rely on global validation.
- Validate input at the edge and never trust client data.

## Database Rules
- Use Prisma properly and consistently.
- Normalize data where it helps the model.
- Add indexes when query patterns justify them.
- Avoid N+1 queries and unnecessary full-table reads.
- Use pagination for large result sets.

## Security Rules
- Protect routes with guards.
- Separate authentication from authorization.
- Never expose sensitive data.
- Sanitize and validate data before use.

## API Design
- Follow REST conventions.
- Use proper HTTP status codes.
- Keep response shapes consistent.
- Prefer built-in NestJS features over custom replacements.

## Error Handling and Logging
- Use built-in NestJS exceptions for expected failures.
- Add a global exception filter only when the task needs it.
- Use centralized logging patterns and avoid ad hoc console output.

## Performance
- Avoid heavy queries without limits.
- Prefer caching only when there is a real need.
- Keep async work non-blocking.

## Testing and Quality
- Add or update unit tests for services when behavior changes.
- Add or update e2e tests for controller-level behavior when needed.
- Keep naming consistent and code formatted.

## Validation Before Finalizing
- Check the current controller, service, module, DTO, and Prisma patterns before editing.
- Keep API behavior aligned with the frontend contract in `README.md`.
- Preserve role-based access control and JWT auth unless the task explicitly changes them.
- Run `npm run build` after backend changes when possible.
- If schema or generated client code changes, run the Prisma generation workflow used by the project.

## Important Files
- `README.md` for the API contract.
- `package.json` for available scripts.
- `src/` for the NestJS application structure.