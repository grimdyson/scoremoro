# Scoremoro — Decision Log

Format: **[Status]** Decision — rationale. Status is `DECIDED`, `OPEN`, or `REVISIT`.

---

## D-001: Desktop Shell — Electron vs Tauri

**[DECIDED]** Use **Tauri v2** for V1.

| Factor | Electron | Tauri v2 |
|---|---|---|
| Bundle size | ~80–150 MB | ~3–10 MB |
| Memory footprint | Higher (full Chromium) | Lower (system webview) |
| Always-on-top | Supported | Supported |
| Frameless + draggable | Supported | Supported |
| System tray | Supported | Supported |
| System theme detection | `nativeTheme` API | `window.matchMedia` + Tauri plugin |
| Audio playback | Web Audio API works | Web Audio API works |
| Windows webview | Chromium (bundled) | WebView2 (Edge, pre-installed Win10+) |
| macOS webview | Chromium (bundled) | WKWebView (system) |
| Rust requirement | No | Yes (build toolchain only) |
| Maturity | Very mature | Stable v2, growing ecosystem |
| Auto-update | electron-updater | Tauri updater plugin |

**Rationale:** Scoremoro is a small, focused utility. The small bundle and low memory usage of Tauri align with the product. The Rust backend gives clean separation for platform code. WebView2 ships pre-installed on all supported Windows versions.

**Risk:** Tauri's webview has minor rendering differences from Chromium. Test thoroughly. If webview quirks block shipping, fall back to Electron — the platform abstraction layer makes this swap feasible.

---

## D-002: UI Framework

**[DECIDED]** Use **React** (with TypeScript, via Vite).

**Rationale:** The PRD specifies React for both shell options. React has the broadest ecosystem, best TypeScript support, and the largest pool of contributors. For a small app the bundle size difference vs lighter frameworks is negligible (< 50 KB gzipped). React's hooks + context model is sufficient for the timer state machine; no external state library needed for V1.

**Alternatives considered:** Solid.js (smaller runtime, but smaller ecosystem and contributor pool), Svelte (compiler approach is nice but adds a build concept), vanilla TS (too much boilerplate for component state).

---

## D-003: Styling Approach

**[DECIDED]** Plain CSS with custom properties. No CSS-in-JS, no preprocessor.

**Rationale:** The app is small. CSS custom properties handle theming and scaling natively. Avoiding a CSS build step simplifies the toolchain. If component styles grow unwieldy, revisit with CSS Modules.

---

## D-004: Timer Tick Mechanism

**[DECIDED]** `setInterval(250ms)` + wall-clock `endTimestampMs` comparison.

**Rationale:** `endTimestampMs` as the source of truth avoids accumulated drift from `setInterval` jitter. On pause, `remainingMs` is stored exactly; on resume, `endTimestampMs` is recalculated. 250 ms gives smooth countdown display without excessive CPU wake-ups. The interval is only active during `RunningWork` or `RunningBreak`.

**Sleep/wake:** When the system wakes and the next tick fires, `Date.now()` will be past `endTimestampMs`, so the timer correctly transitions to finished.

---

## D-005: State Management

**[DECIDED]** Core state machine is a pure TypeScript module (no framework dependency). React integration via `useReducer` + context in `src/app`.

**Rationale:** The state is small and well-defined (7 states, ~12 transitions). An external library (Redux, Zustand) adds weight with no benefit at this scale. Keeping the core pure means it's testable without React and portable if we ever swap the UI framework.

---

## D-006: Testing Framework

**[DECIDED]** **Vitest**.

**Rationale:** Native ESM, TypeScript support out of the box, fast, compatible with Vite (which Tauri uses). Same assertion API as Jest for familiarity.

---

## D-007: Linter and Formatter

**[DECIDED]** **Biome** for both linting and formatting.

**Rationale:** Single tool, fast (Rust-based), handles both formatting and linting. Reduces config surface compared to ESLint + Prettier. Supports TypeScript and JSX natively.

**Fallback:** If Biome lacks a needed rule, add ESLint for that specific case only.

---

## D-008: Audio Format

**[OPEN]** Which format for bundled tones?

Options: OGG Vorbis (small, good browser support), MP3 (ubiquitous), WAV (no decode overhead, larger).

Leaning toward **OGG** with MP3 fallback, but needs testing in WebView2.

---

## D-009: Persistence Backend

**[DECIDED]** Use Tauri's `tauri-plugin-store` (JSON file under app data dir).

**Rationale:** Built-in, works cross-platform, simple key-value. Avoids pulling in a database for a handful of settings. Settings are schema-validated at load; corrupt data resets to defaults.

---

## D-010: Timer States — Expanded Model

**[DECIDED]** Seven explicit states: `Idle`, `RunningWork`, `PausedWork`, `WorkFinished`, `RunningBreak`, `PausedBreak`, `BreakFinished`.

**Rationale:** The PRD requires distinct Work and Break phases with independent running/paused/finished states. Using separate states (rather than a `Running` + `mode` flag) makes the transition table explicit and eliminates impossible-state bugs. Each state maps 1:1 to a screen layout.

---

## D-011: Skip Behaviour

**[DECIDED]** "Skip to break" transitions `RunningWork` → `RunningBreak` immediately. No tone plays on skip (prevents audio spam).

**Rationale:** Skipping is an intentional user action. Playing the work-complete tone would be misleading. The break timer starts fresh with the configured break duration.

---

## D-012: Close Behaviour

**[DECIDED]** V1: close = minimize/hide while timer is running. If system tray is implemented, close hides to tray and timer continues.

**Rationale:** Accidentally closing during an active session is frustrating. Hiding preserves the session. When `Idle`, close quits the app.

---

## D-013: Auto-Start Break

**[OPEN]** Should the break timer start automatically after Work finishes, or require a manual "Start Break" action?

Leaning toward **configurable** with a brief dwell (0.8–1.2 s) in `WorkFinished` before auto-transitioning. Default: auto-start on. Stored in settings.

---

## D-014: Keyboard Shortcuts

**[DECIDED]** Hard-coded for V1. Make configurable in V2.

| Action | Notes |
|---|---|
| Start / Pause toggle | Primary shortcut |
| Skip to break | During `RunningWork` only |
| Restart | From `BreakFinished` |
| Mute toggle | Global |

Exact key bindings TBD during implementation. Registered via `IShortcutManager` in the platform layer.

---

## D-015: Ruler Modifier Keys

**[DECIDED]** Shift = 5-minute steps, Ctrl = 15-minute steps during drag. Default = 1-minute.

**Rationale:** Matches common modifier conventions (Shift = medium jump, Ctrl = large jump). Scroll uses default 1-minute steps only for V1.

---

## D-016: Ruler Disabled While Running

**[DECIDED]** V1 disables the ruler and mode selector cards during all non-Idle states.

**Rationale:** Allowing mid-session duration changes introduces edge cases (what happens to elapsed time? does the progress bar rescale?). Defer to a later version when the UX for this is designed.

---

## Open Questions

- **OQ-1:** Exact min window size and aspect ratio constraints.
- **OQ-2:** Auto-start break: default on or off? Dwell duration?
- **OQ-3:** Exact keyboard shortcut bindings (keycodes).
- **OQ-4:** Should the app live in the system tray when idle, or only when timer is running?
- **OQ-5:** WebView2 audio format support — need to test OGG playback.
