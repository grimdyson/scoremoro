# Contributing to Scoremoro

## Prerequisites

- Node.js 20+
- Rust toolchain (for Tauri) — install via [rustup](https://rustup.rs/)
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)

## Setup

```sh
pnpm install
pnpm tauri dev
```

## Branch Conventions

| Branch | Purpose |
|---|---|
| `main` | Stable, release-ready. Protected. |
| `dev` | Integration branch. PRs merge here first. |
| `feat/<name>` | Feature work. Branch from `dev`. |
| `fix/<name>` | Bug fixes. Branch from `dev`. |
| `chore/<name>` | Tooling, deps, CI changes. |

Always branch from `dev`. Open PRs against `dev`. `main` is updated via release merges only.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`, `perf`, `ci`.

**Scope:** `core`, `ui`, `platform`, `app`, `config`, or omit if broad.

**Examples:**

```
feat(core): implement timer state machine
fix(ui): prevent ruler drag when timer is running
chore(config): add biome.json
test(core): add tick drift tolerance tests
docs: update TASKS.md with M3 progress
```

Keep the summary under 72 characters. Use imperative mood ("add", not "added").

## Code Style

- **Formatter + Linter:** Biome. Run `pnpm check` before committing.
- **TypeScript:** `strict: true`. No `any` unless justified with a comment.
- **Naming:** camelCase for variables/functions, PascalCase for types/components, UPPER_SNAKE for constants.
- **Imports:** Use path aliases (`@core/`, `@ui/`, `@platform/`, `@app/`). Avoid relative paths crossing layer boundaries.
- **No default exports.** Use named exports everywhere.
- **React components:** Functional components only. No class components. Prefer hooks + context over external state libraries.

## Formatting Commands

```sh
pnpm format        # Auto-format all files
pnpm lint          # Lint all files
pnpm check         # Format + lint + typecheck
pnpm test          # Run tests
pnpm test:watch    # Run tests in watch mode
```

## Testing

- Tests live in `tests/` mirroring `src/` structure.
- Core logic must have unit tests. UI tests are encouraged but not required for V1.
- Use Vitest. Run with `pnpm test`.

## Pull Requests

- One logical change per PR.
- PR title follows commit message format.
- Ensure `pnpm check` and `pnpm test` pass.
- Request review from at least one maintainer.
- Squash-merge into `dev`.
