# Scoremoro

A desktop Pomodoro timer that runs as an always-on-top Picture-in-Picture window. Scoremoro adds light gamification through a subtle session scoreboard, rewarding completed work and break cycles to help you build consistency without distracting from the task. Built with a clean, minimal UI and designed to stay pinned while you work.

**Status:** Pre-development. Scaffolding and documentation phase.

![](./src/ui/assets/splash.png)

## Tech Stack

- **Shell:** Tauri v2
- **UI:** React + TypeScript
- **Build:** Vite
- **Lint/Format:** Biome
- **Tests:** Vitest

## Prerequisites

- Node.js 20+
- Rust toolchain — [rustup.rs](https://rustup.rs/)
- pnpm

```sh
corepack enable
corepack prepare pnpm@latest --activate
```

## Setup

```sh
git clone https://github.com/grimdyson/Pomme-VScode.git
cd Pomme-VScode
pnpm install
```

## Development

```sh
pnpm tauri dev        # Launch dev window with hot reload
```

## Build

```sh
pnpm tauri build      # Produce release binary + installer
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server (UI only, no Tauri shell) |
| `pnpm tauri dev` | Full dev mode with Tauri window |
| `pnpm tauri build` | Production build |
| `pnpm format` | Format code (Biome) |
| `pnpm lint` | Lint code (Biome) |
| `pnpm check` | Format + lint + typecheck |
| `pnpm test` | Run unit tests |

## Project Structure

```
src/
  core/       Pure logic — timer state machine, ruler math, types
  ui/         Components, styles, event bindings
  platform/   OS integration interfaces + implementations
  app/        Entry point, wiring, bootstrap
tests/
  core/       Unit tests for core logic
```

## Documentation

- [PRD.md](PRD.md) — Product requirements
- [ARCHITECTURE.md](ARCHITECTURE.md) — System design
- [DECISIONS.md](DECISIONS.md) — Decision log
- [TASKS.md](TASKS.md) — Implementation checklist
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute

## License

TBD
