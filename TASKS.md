# Scoremoro — Task Checklist

Sequenced by dependency. Each milestone is a working vertical slice where possible. Aligned with PRD §14.

---

## M1: App Shell + Always-on-Top Window + UI Scaffolding

- [ ] Initialise Tauri v2 project with Vite + React + TypeScript template
- [ ] Configure TypeScript (`strict: true`, path aliases `@core/`, `@ui/`, `@platform/`, `@app/`)
- [ ] Configure Biome (formatter + linter)
- [ ] Configure Vitest
- [ ] Confirm folder structure: `src/core`, `src/ui`, `src/platform`, `src/app`, `tests/core`
- [ ] Create frameless Tauri window (always-on-top, draggable, resizable, min/max constraints)
- [ ] Implement close-to-hide behaviour (V1: hide while running, quit while idle)
- [ ] Build minimal layout skeleton: InfoCluster, TimelineRuler area, ModeSelectorCards, ActionCluster, StartPomodoro CTA
- [ ] Verify drag, resize, and always-on-top behaviour on Windows
- [ ] Add CI pipeline (lint, typecheck, test) — GitHub Actions
- [ ] Verify `pnpm tauri dev` and `pnpm tauri build` work on Windows

---

## M2: Core Timer + States

- [ ] Define types: `TimerState` (7 states), `TimerConfig`, `SelectionMode`, `Settings`
- [ ] Implement timer state machine with full transition table (Idle → RunningWork → PausedWork → WorkFinished → RunningBreak → PausedBreak → BreakFinished)
- [ ] Implement `skip()` transition: RunningWork → RunningBreak (no tone)
- [ ] Implement time model: `endTimestampMs` (running), `remainingMs` (paused)
- [ ] Implement tick logic: `setInterval(250ms)` + wall-clock comparison
- [ ] Handle sleep/wake reconciliation (tick after wake detects past-end → finished)
- [ ] Wire core state to UI via React context + reducer
- [ ] Build TimerMetrics component (remaining large, elapsed grey)
- [ ] Build SegmentedProgressBar (red for work, blue for break)
- [ ] Implement screen-state switching (Idle ↔ RunningWork ↔ WorkFinished ↔ RunningBreak ↔ BreakFinished)
- [ ] Unit tests: all state transitions, tick drift tolerance, sleep/wake edge cases
- [ ] Debounce rapid input to prevent double transitions

---

## M3: Ruler Interaction + Work/Break Selection

- [ ] Implement ruler value calculation from drag delta (1-min default, Shift = 5-min, Ctrl = 15-min)
- [ ] Implement ruler value calculation from scroll delta
- [ ] Implement selection state management: `Deselected`, `WorkSelected`, `BreakSelected`
- [ ] Implement auto-select-Work-on-interact rule (drag or scroll when Deselected)
- [ ] Lock selected mode during active drag (no auto-switch mid-drag)
- [ ] Implement clamping: Work [1, 180], Break [1, 60]
- [ ] Build TimelineRuler component (tick marks, vertical marker, value label)
- [ ] Build ModeSelectorCard components (Work = red accent, Break = blue accent)
- [ ] Clicking Work card → `WorkSelected`; clicking Break card → `BreakSelected`
- [ ] Disable ruler + mode selectors when state ≠ `Idle`
- [ ] Visual feedback: Deselected = neutral/subdued marker, selected = accented marker
- [ ] Unit tests: ruler math, clamping, selection transitions, modifier key steps

---

## M4: Persistence (Settings + Window Bounds)

- [ ] Define platform interface `IStorage` in `src/platform/interfaces.ts`
- [ ] Implement `IStorage` via `tauri-plugin-store`
- [ ] Define settings schema with defaults (work min, break min, theme, mute, volume, scale, bounds)
- [ ] Schema-validate on load; reset corrupt data to defaults
- [ ] Save settings on change (debounced)
- [ ] Restore window position and size on launch (clamp to visible area / multi-monitor)
- [ ] Unit tests: settings validation, corrupt-data recovery

---

## M5: Theme Follow System + Override

- [ ] Define CSS custom property token sets (light + dark)
- [ ] Define platform interface `IThemeProvider`
- [ ] Detect system theme via `prefers-color-scheme` media query + change listener
- [ ] Implement manual override: system / light / dark (applied instantly)
- [ ] Persist theme choice via `IStorage`
- [ ] Ensure accessible contrast in both themes
- [ ] Verify in Windows light and dark modes

---

## M6: Audio Tones + Mute/Volume

- [ ] Bundle placeholder tone files: work-complete, break-complete
- [ ] Define platform interface `IAudioPlayer`
- [ ] Implement `IAudioPlayer` using Web Audio API
- [ ] Play work-complete tone on `WorkFinished` transition (unless muted)
- [ ] Play break-complete tone on `BreakFinished` transition (unless muted)
- [ ] No tone on `skip()` transition
- [ ] Build mute toggle in ActionCluster
- [ ] Build volume slider (0–100%, persisted)
- [ ] Handle audio device failure: fail silently + show warning indicator
- [ ] Test tone playback in WebView2 (verify OGG / MP3 support)

---

## M7: Keyboard Shortcuts

- [ ] Define platform interface `IShortcutManager`
- [ ] Implement `IShortcutManager` for Windows (Tauri global shortcut plugin or in-app key listener)
- [ ] Register: Start/Pause toggle, Skip to break, Restart, Mute toggle
- [ ] Hard-code key bindings for V1
- [ ] Verify shortcuts work when window is focused and when global (if using global shortcuts)

---

## M8: Packaging for Windows

- [ ] Configure Tauri build for Windows (MSI or NSIS installer)
- [ ] Add app icon (placeholder or final)
- [ ] Configure auto-update (Tauri updater plugin) — optional for V1
- [ ] Smoke test on clean Windows 10/11 install
- [ ] Verify WebView2 presence or bundled fallback

---

## M9: Polish (A11y, Tests, UX Refinements)

- [ ] Replace placeholder tones with final audio assets
- [ ] Refine animations and transitions (calm motion, no jarring)
- [ ] Review and fix a11y: keyboard navigation, focus rings, screen reader labels
- [ ] Expand test coverage: ruler UI interactions, screen state transitions
- [ ] Final code review and cleanup
- [ ] Update all documentation to match shipped behaviour
- [ ] Tag v1.0.0 release

---

## Acceptance Criteria (from PRD §15)

- [ ] Always-on-top window behaves reliably
- [ ] Ruler sets Work/Break minutes via drag and scroll; deselected interaction auto-selects Work
- [ ] Timer is accurate across sleep/wake
- [ ] Work and Break completion tones play once and can be muted
- [ ] Theme follows system and can be overridden
- [ ] All sizing uses rems and UI scale works
- [ ] Settings and window bounds persist
- [ ] Core timer and ruler logic are unit-tested

---

## Future (Post-V1)

- [ ] macOS platform implementation (`src/platform/macos/`)
- [ ] Auto-chaining sessions (configurable)
- [ ] Long-break cycles
- [ ] Configurable keyboard shortcuts
- [ ] Session history / statistics
- [ ] Custom imported tone files
- [ ] System tray behaviour refinements
