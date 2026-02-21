# Scoremoro

A desktop Pomodoro timer that runs as an always-on-top Picture-in-Picture window. Scoremoro adds light gamification through a subtle session scoreboard, rewarding completed work and break cycles to help you build consistency without distracting from the task. Built with a clean, minimal UI and designed to stay pinned while you work.

![](./src/ui/assets/splash.png)

## Tech Stack

- **Shell:** Electron
- **UI:** React + TypeScript
- **Build:** Vite + electron-builder
- **Lint/Format:** Biome
- **Tests:** Vitest

## Prerequisites

- Node.js 20+
- pnpm

```sh
corepack enable
corepack prepare pnpm@latest --activate
```

## Setup

```sh
git clone https://github.com/grimdyson/Scoremoro.git
cd Scoremoro
pnpm install
```

## Development

```sh
pnpm dev              # Start Vite dev server (UI only)
pnpm dev:electron     # Build and launch Electron window
```

## Build

```sh
pnpm dist             # Produce release binary via electron-builder
```

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server (UI only, no Electron shell) |
| `pnpm dev:electron` | Build and launch full Electron window |
| `pnpm build` | TypeScript check + Vite production build |
| `pnpm dist` | Full production build + electron-builder packaging |
| `pnpm format` | Format code (Biome) |
| `pnpm lint` | Lint code (Biome) |
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
