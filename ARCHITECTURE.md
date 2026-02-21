# Scoremoro — Architecture

## Layers

```
┌─────────────────────────────────┐
│            src/app              │  ← Entry point, wiring, bootstrap
├─────────────────────────────────┤
│            src/ui               │  ← Components, styles, screens
├─────────────────────────────────┤
│           src/core              │  ← Timer state machine, ruler logic, types
├─────────────────────────────────┤
│         src/platform            │  ← OS integration: window, audio, storage, shortcuts
└─────────────────────────────────┘
```

**Dependency rule:** each layer may depend only on the layer directly below it. `src/core` depends on nothing. `src/platform` depends on nothing in `src/ui`.

---

## src/core

Pure TypeScript. Zero dependencies on UI framework, DOM, or platform APIs.

Contains:

- **Timer state machine** — manages all seven states and transitions (see below).
- **Time model** — `endTimestampMs` (running) / `remainingMs` (paused) source-of-truth logic.
- **Ruler logic** — drag-delta and scroll-delta to minutes mapping, modifier keys (Shift = 5 min, Ctrl = 15 min), clamping, selection-state management.
- **Types** — shared interfaces and enums: `TimerState`, `SelectionMode`, `TimerConfig`, `Settings`.
- **Settings schema** — canonical defaults, Zod (or similar) schema for validation at load.

The core is fully unit-testable without mocking a browser or OS environment.

---

## src/ui

Renderer-side code. React components, styles, event handling.

- **InfoCluster** — current time, finish time (accented to active mode).
- **TimelineRuler** — renders tick marks, marker, binds drag+scroll, calls into core ruler logic.
- **ModeSelectorCard** — Work and Break cards; clicking selects the ruler mode.
- **TimerMetrics** — remaining (primary, large), elapsed (secondary, grey).
- **SegmentedProgressBar** — fills with red (Work) or blue (Break).
- **ActionCluster** — mute toggle, close, skip-to-break, restart.
- **StartPomodoro CTA** — primary action on idle.
- **Styles** — CSS custom properties for theming (`light` / `dark` token sets) and scaling (`--app-font-scale`).

### Screen States

| Screen | Visible Components |
|---|---|
| **Idle** | InfoCluster, TimelineRuler, ModeSelectorCards, StartPomodoro CTA |
| **RunningWork** | TimerMetrics (red), SegmentedProgressBar (red), ActionCluster (mute, close, skip) |
| **WorkFinished** | TimerMetrics (red, 00:00), ActionCluster (mute, close, start break) |
| **RunningBreak** | TimerMetrics (blue), SegmentedProgressBar (blue), ActionCluster (mute, close) |
| **BreakFinished** | TimerMetrics (blue, 00:00), ActionCluster (mute, restart, close) |

`PausedWork` and `PausedBreak` render the same as their running counterpart with a paused indicator.

---

## src/platform

Abstraction layer for OS and shell capabilities. Each capability is defined as a TypeScript interface in `src/platform/interfaces.ts`. Implementations are swapped per platform.

| Capability | Interface | Notes |
|---|---|---|
| Window management | `IWindowManager` | Always-on-top, frameless, drag, resize, bounds persistence, close-to-tray. |
| Audio playback | `IAudioPlayer` | Play bundled tones, volume control. Web Audio API. |
| Persistent storage | `IStorage` | Read/write settings JSON. Schema-validated. |
| System theme detection | `IThemeProvider` | `prefers-color-scheme` media query + change listener. |
| Global shortcuts | `IShortcutManager` | Register/unregister OS-level keyboard shortcuts. |

```
src/platform/
  interfaces.ts
  windows/
    windowManager.ts
    audioPlayer.ts
    storage.ts
    themeProvider.ts
    shortcutManager.ts
  macos/          ← future
```

---

## src/app

Composition root. Glues everything together:

- Selects the correct platform implementation.
- Creates the main window via `IWindowManager`.
- Instantiates the core timer and ruler.
- Wires core state changes → UI re-renders.
- Wires core events → platform actions (play tone on `WorkFinished`, save settings on change).
- Registers global shortcuts via `IShortcutManager`.

---

## Timer State Machine

### States

```
                   start()
         Idle ──────────────▶ RunningWork
          ▲                       │  │
          │            pause()    │  │ tick()→0
          │                       ▼  │
          │                  PausedWork
          │                       │  │
          │            resume()   │  │ reset()
          │                       ▼  │
          │                  RunningWork ◀┘
          │                       │
          │              tick()→0 │
          │                       ▼
          │                 WorkFinished
          │                    │     │
          │    auto/manual     │     │ skip (from RunningWork)
          │                    ▼     │
          │               RunningBreak ◀┘
          │                    │  │
          │         pause()    │  │ tick()→0
          │                    ▼  │
          │               PausedBreak
          │                    │  │
          │         resume()   │  │ reset()
          │                    ▼  │
          │               RunningBreak ◀┘
          │                    │
          │           tick()→0 │
          │                    ▼
          └─── reset() ── BreakFinished
```

### Transition Table

| From | Event | To | Side Effects |
|---|---|---|---|
| `Idle` | `start()` | `RunningWork` | Set `endTimestampMs`. Start tick interval. Ruler disabled. Selection → `Deselected`. |
| `RunningWork` | `tick()` → 0 | `WorkFinished` | Stop interval. Play work-complete tone. |
| `RunningWork` | `pause()` | `PausedWork` | Store `remainingMs`. Stop interval. |
| `RunningWork` | `skip()` | `RunningBreak` | Stop work interval. Set `endTimestampMs` for break. Start break interval. No tone. |
| `PausedWork` | `resume()` | `RunningWork` | Recalculate `endTimestampMs` from `remainingMs`. Restart interval. |
| `PausedWork` | `reset()` | `Idle` | Clear time. Ruler enabled. |
| `WorkFinished` | `startBreak()` | `RunningBreak` | Set `endTimestampMs` for break. Start interval. |
| `WorkFinished` | `reset()` | `Idle` | Ruler enabled. |
| `RunningBreak` | `tick()` → 0 | `BreakFinished` | Stop interval. Play break-complete tone. |
| `RunningBreak` | `pause()` | `PausedBreak` | Store `remainingMs`. Stop interval. |
| `PausedBreak` | `resume()` | `RunningBreak` | Recalculate `endTimestampMs`. Restart interval. |
| `PausedBreak` | `reset()` | `Idle` | Clear time. Ruler enabled. |
| `BreakFinished` | `reset()` | `Idle` | Ruler enabled. |

### Time Model

```
Running:
  endTimestampMs = Date.now() + durationMs
  remaining     = max(0, endTimestampMs - Date.now())

Paused:
  remainingMs   = frozen value at pause time

Resume:
  endTimestampMs = Date.now() + remainingMs

Sleep/Wake:
  On next tick after wake, remaining = endTimestampMs - Date.now()
  If remaining ≤ 0 → transition to finished state
```

### Tick Strategy

`setInterval(250ms)`. Each tick reads `Date.now()` and computes remaining from `endTimestampMs`. This handles JS timer jitter and sleep/wake naturally. The interval is only active during `RunningWork` or `RunningBreak`.

---

## Data Flow

```
User input (ruler drag, button click, keyboard shortcut)
       │
       ▼
   UI Component ──▶ Core Logic ──▶ State Update
       │                               │
       │                               ▼
       │                        Notify subscribers
       │                               │
       ▼                               ▼
  Platform API                   UI re-render
 (play tone,                   (update display,
  save settings,                ruler position,
  register shortcut)            screen state)
```

Core exposes state via React-compatible reactive primitives (context + reducer, or a lightweight store like Zustand). UI subscribes. Platform side-effects are triggered by the app layer in response to state transitions.

---

## Scaling Approach

```css
:root {
  --app-font-scale: 1;
  font-size: calc(16px * var(--app-font-scale));
}
```

All component sizing uses `rem`. Changing `--app-font-scale` uniformly resizes everything. Discrete steps: 0.9, 1.0, 1.1, 1.25, 1.4. Persisted and applied on startup.

---

## Cross-Platform Strategy

Platform-specific code lives exclusively in `src/platform/`. The app layer imports only the interfaces. A factory function returns the correct implementation based on build target or runtime detection.

Future macOS support means adding `src/platform/macos/` implementations of each interface. Core and UI remain untouched.
