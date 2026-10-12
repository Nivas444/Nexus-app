# Nexus ERP — Project Engineering Rules

## Project Context
This is an existing enterprise operations and resource management application. Maintain the current architecture and established business behavior. Extend the existing implementation instead of creating parallel implementations.

## Architecture
- Frontend: existing vanilla HTML, CSS, and JavaScript application.
- Backend: existing Python/FastAPI-style application.
- Database: existing PostgreSQL database and established schema.
- Backend layering: API routes → services → repositories → SQLAlchemy models/database.
- Existing API client, authentication, authorization, validation, and error-handling conventions must be reused.
- Verify the actual repository before relying on any architecture statement in this document.

## Mandatory Preflight
Before modifying code:
1. Read this file and the README.
2. Inspect Git status and preserve all existing uncommitted user changes. Destructive Git operations (`git reset`, `git restore`, `git checkout`, `git clean`, `git stash drop`) are strictly prohibited without explicit approval.
3. Read the files relevant to the requested feature.
4. Trace the full request path from frontend interaction through API, service, repository, and database where applicable.
5. Check existing models, schemas, routes, imports, tests, and similar working features.
6. Report any uncertainty or missing dependencies instead of inventing an implementation.

## Scope Control
- Implement only the feature or fix I requested.
- Do not rewrite entire files when a small change is sufficient.
- Do not redesign unrelated screens or refactor unrelated modules.
- Do not create duplicate API routes, services, repositories, tables, or utility functions when suitable existing implementations already exist.
- Do not change unrelated naming conventions, response formats, or UI behavior.
- If the requested change requires a wider modification, explain why and obtain my approval first.

## Frontend Rules
- Strictly preserve the existing vanilla HTML, CSS, and JavaScript architecture and styling. Do not introduce unsolicited aesthetic redesigns, modern UI restyling, or frontend framework conversions.
- Reuse existing styles, components, DOM patterns, API client (`window.NexusApi`), and event handlers.
- Safe large-file edits: Monolithic frontend files (`home.js`, `home.html`, `home.css`) must only be modified with small, targeted edits using verified search anchors and exact line numbers. Full-file rewrites are prohibited. Inspect git diff immediately after editing.
- Preserve existing validation, form behavior, loading states, error messages, and navigation.
- Do not introduce a frontend framework or new dependency without approval.
- Verify endpoint paths, HTTP methods, request payloads, and response shapes against the actual backend.

## Backend Rules
- Follow existing router, service, repository, schema, model, and dependency-injection patterns.
- Keep business logic in the appropriate existing layer.
- Maintain backward compatibility for API request and response fields (including dual `snake_case` and `camelCase` mappings) based on verified frontend consumers.
- Preserve authentication, authorization, validation, and error-handling behavior.
- Never invent routes, model attributes, environment variables, or database columns.
- Check all relevant callers before changing shared interfaces.

## PostgreSQL and Migrations
- Inspect the existing schema and models before proposing database changes.
- Do not create, drop, rename, or alter tables or columns without explicit approval.
- Never reset a database or run destructive SQL against a production or unknown database.
- If a schema change is necessary, explain the impact and migration/rollback approach before implementation.
- Never expose credentials, tokens, or database secrets.

## Test Suite Safety
- Do not run the existing pytest suite until its database connection is confirmed to be isolated from live data (existing test fixtures connect directly to `SessionLocal()` against live PostgreSQL).

## Nexus-MCP Boundary
- Treat Nexus-MCP as separate tooling, not as part of the application runtime.
- Do not move, merge, rename, delete, or modify MCP server files or configuration unless explicitly requested.
- Do not assume MCP tools are available or successful without checking their actual results.
- Use read-only inspection tools first when they are available.

## Implementation and Verification
For non-trivial tasks:
1. Present a short diagnosis and implementation plan.
2. List the exact files expected to change.
3. Explain the risk to existing behavior.
4. Wait for my approval before implementation.

After approval:
- Make the smallest targeted change.
- Run relevant existing tests and available checks only if confirmed safe and non-destructive.
- Inspect the final Git diff.
- Check for unintended changes and broken imports or interfaces.
- Report actual results, including failures and checks that could not run.

## Completion Report
Always provide:
- Root cause or reason for the change.
- Files modified and purpose of each modification.
- Tests and commands actually executed.
- Verification results.
- Remaining risks or unresolved issues.

Never claim that code, tests, builds, APIs, or database operations succeeded unless the evidence confirms it.