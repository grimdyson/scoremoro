# Scoremoro — Product Requirements Document

## 1. Summary

Scoremoro is a Windows desktop Pomodoro timer that stays pinned above other windows like a PiP overlay. It uses a ruler-based interaction to set Work and Break minutes (click+drag or hover+scroll), follows system light/dark mode by default (with override), and plays gentle custom tones at the end of Work and Break blocks. The codebase is structured to support a future macOS build with minimal rework.

**Target platforms:** Windows (V1), macOS (planned).

---

## 2. Goals

- Always-on-top, compact timer window that can be positioned anywhere.
- Ruler is the primary duration control for Work/Break minutes.
- Clear timer states (idle, running work, work finished, running break, break finished).
- Calm, custom audio tones for block completion (work vs break).
- Theme follows system light/dark (with manual override).
- Local persistence for settings and window bounds.
- Modern code practices: TypeScript-first, explicit timer state machine, clean separation between core logic and platform integration.

---

## 3. Non-Goals (V1)

- Accounts, sync, cloud history.
- Task lists / project management.
- Collaboration / teams.
- Complex stats dashboards.
- Custom imported sound files (bundle tones in V1; import later).

---

## 4. Target Users

People who like Pomodoro and want a quiet, always-visible timer that doesn't blast a loud alarm.

---

## 5. UX Principles

- **Visible but not distracting:** minimal UI, calm motion, no loud sounds.
- **One-glance clarity:** remaining time is primary.
- **Fast control:** start / pause / skip / reset are immediate.
- **Respect OS conventions:** theme follows system by default.

---

## 6. Core User Stories

1. I can set Work and Break minutes using the ruler without opening settings.
2. I can start a work sprint and keep the timer always on top.
3. I can pause/resume without time drift.
4. I can skip from work to break intentionally.
5. I hear a gentle tone when work ends and when break ends (or mute it).
6. I can override theme (system / light / dark).
7. The app remembers my durations and window position.

---

## 7. Primary Flows

### Flow A — Configure then Start

1. User adjusts Work and/or Break minutes via ruler (and/or clicking the Work/Break cards).
2. User clicks "Start Pomodoro".
3. Timer enters `RunningWork` state.

### Flow B — Work Completes

1. Timer reaches `00:00`.
2. Play "Work complete" tone (once, short).
3. Transition to break (auto-start configurable).
4. UI updates to break styling.

### Flow C — Break Completes

1. Timer reaches `00:00`.
2. Play "Break complete" tone.
3. Show `BreakFinished` state with clear "Restart" action to begin a new work sprint.

### Flow D — Skip

- While `RunningWork`: "Skip to break" transitions immediately to `RunningBreak`.
- Default: no completion tone on manual skip (prevents audio spam).

---

## 8. Functional Requirements

### 8.1 Timer Engine

Accurate countdown; uses timestamps to reconcile sleep/wake.

**Durations:**

| Block | Default | Min | Max |
|---|---|---|---|
| Work | 25 min | 1 min | 180 min |
| Break | 5 min | 1 min | 60 min |

**States:**

| State | Description |
|---|---|
| `Idle` | No timer active. Ruler editable. Display shows configured duration. |
| `RunningWork` | Work countdown active. Ruler disabled. |
| `PausedWork` | Work countdown frozen. Ruler disabled. |
| `WorkFinished` | Work reached 0:00. Tone plays. Brief dwell state before break. |
| `RunningBreak` | Break countdown active. Ruler disabled. |
| `PausedBreak` | Break countdown frozen. Ruler disabled. |
| `BreakFinished` | Break reached 0:00. Tone plays. "Restart" action visible. |

**Time model:**

- While running: `endTimestampMs` is the source of truth.
- While paused: `remainingMs` stored exactly.
- Tick interval: 250 ms, compares `Date.now()` against `endTimestampMs` to avoid drift.
- Sleep/wake: on resume, remaining = `endTimestampMs - Date.now()`. If negative, transition to finished.

**V1 rule:** Durations cannot be changed while running. Ruler + mode selectors disabled unless `Idle`.

### 8.2 Always-on-Top PiP Window

| Property | Spec |
|---|---|
| Always-on-top | Yes, by default. |
| Draggable | Entire background is drag region (except interactive controls). |
| Resizable | Free resize with min/max constraints. |
| Frameless | Custom chrome. Close button visible. |

- Remembers last position/size (clamped to visible area on restore).
- **Close behaviour (V1):** Close = minimize/hide (not quit) while timer is running. If tray icon is implemented, close hides to tray and timer continues.

### 8.3 Audio

Two bundled tones: Work complete, Break complete.

| Control | Spec |
|---|---|
| Mute toggle | Silences all tones. |
| Volume slider | App-level, 0–100%. |
| Tone design | Short (< 3 s), subtle, no looping alarm. |

Custom imported tones are out of scope for V1.

### 8.4 Theme

| Mode | Behaviour |
|---|---|
| Follow system (default) | Reads OS light/dark preference. |
| Force light | Always light, regardless of OS. |
| Force dark | Always dark, regardless of OS. |

Applied instantly. Uses a minimal CSS token set with accessible contrast.

### 8.5 Keyboard Shortcuts (Windows)

| Action | Default Shortcut |
|---|---|
| Start / Pause toggle | Hard-coded for V1 |
| Skip to break | Hard-coded for V1 |
| Restart (from BreakFinished) | Hard-coded for V1 |
| Mute toggle | Hard-coded for V1 |

Shortcuts are hard-coded for V1; make configurable later.

### 8.6 Persistence

Stored locally. Schema-validated at load; corrupt data resets to defaults.

- Work minutes
- Break minutes
- Theme mode
- Mute + volume
- UI scale
- Last window bounds

---

## 9. Ruler Interaction Spec

### 9.1 Purpose

The ruler is the primary control for selecting minutes. It supports click+drag and hover+scroll.

### 9.2 Selection States

| State | Meaning |
|---|---|
| `Deselected` | No mode actively being edited. |
| `WorkSelected` | Ruler edits Work duration. |
| `BreakSelected` | Ruler edits Break duration. |

### 9.3 Default Selection Rule

If state is `Deselected` and the user interacts with the ruler (drag or scroll), auto-select `WorkSelected` and edit Work minutes.

### 9.4 Interactions

**Click + drag:**

| Aspect | Spec |
|---|---|
| Direction | Drag right = increase, drag left = decrease. |
| Default granularity | 1-minute steps. |
| Shift modifier | 5-minute steps. |
| Ctrl modifier | 15-minute steps. |
| Lock | During a drag, the selected mode is locked (no auto-switch mid-drag). |

**Hover + scroll:**

| Aspect | Spec |
|---|---|
| Direction | Scroll up = increase, scroll down = decrease. |
| Auto-select | If `Deselected`, first scroll auto-selects Work. |

### 9.5 Mode Selection (Explicit)

- Clicking the **Work card** → `WorkSelected`.
- Clicking the **Break card** → `BreakSelected`.
- Ruler edits the currently selected mode.

### 9.6 Bounds

| Mode | Min | Max |
|---|---|---|
| Work | 1 min | 180 min |
| Break | 1 min | 60 min |

### 9.7 Visual Feedback

- Ruler always visible with tick marks.
- Selected minute highlighted by a vertical marker line and/or highlighted tick region.
- **Work** uses red accent; **Break** uses blue accent.
- `Deselected`: marker is neutral/subdued; hover indicates interactivity.

---

## 10. UI Specification

### 10.1 Layout Components

| Component | Position | Content |
|---|---|---|
| **InfoCluster** | Top-left | Current time, Finish time (accented to active mode). |
| **TimelineRuler** | Dominant area (idle) | Ruler with tick marks and marker. |
| **ModeSelectorCard** | Bottom-left: Work, Bottom-right: Break | Duration cards. Clicking selects ruler mode. |
| **StartPomodoro CTA** | Top-right (idle) | Primary action button. |
| **Metrics** | Center (running/finished) | Remaining (primary, large), Elapsed (secondary, grey). |
| **ActionCluster** | Top-right | Speaker/mute, Close, Skip-to-break, Restart. |

### 10.2 Screen States

**Landing (Idle):**
- Shows ruler, Work/Break cards, current/finish times, Start CTA.
- Ruler edits minutes per selection spec.
- If nothing selected, ruler interaction auto-selects Work.

**Pomodoro Started (RunningWork):**
- Remaining time large (red accent), elapsed grey.
- Segmented progress bar (red fills).
- Actions: mute, close, skip to break.

**Pomodoro Finished (WorkFinished):**
- Remaining shows `00:00` (red accent), elapsed shows total.
- Tone plays once (unless muted).
- Optional brief dwell (0.8–1.2 s) before switching to break if auto-start enabled.
- Actions: mute, close, skip to break / start break.

**Break Started (RunningBreak):**
- Remaining time large (blue accent), elapsed grey.
- Segmented progress bar (blue fills).
- Actions: mute, close.

**Break Finished (BreakFinished):**
- Remaining shows `00:00` (blue accent), elapsed shows total.
- Actions: mute, restart, close.

---

## 11. Typography and Scaling

### 11.1 Approach

Root scaling variable:

```css
:root {
  --app-font-scale: 1;
  font-size: calc(16px * var(--app-font-scale));
}
```

### 11.2 Usage

Use `rem` for: type sizes, spacing, border-radius, component dimensions, icon sizes, progress segment sizes.

### 11.3 Scale Options

Discrete steps: `0.9`, `1.0`, `1.1`, `1.25`, `1.4` (tunable). Persisted.

---

## 12. Architecture Requirements

See [ARCHITECTURE.md](ARCHITECTURE.md) for full detail. Summary:

- Whichever shell is chosen, isolate platform-specific code behind interfaces so core logic remains portable.
- Repo layers: `src/core`, `src/ui`, `src/platform`, `src/app`.
- Explicit state machine over ad-hoc booleans.
- Single source of truth for time. UI renders derived state only.
- Unit tests for: timer transitions, sleep/wake reconciliation, ruler minute selection + clamping, settings validation.

---

## 13. Edge Cases

| Case | Handling |
|---|---|
| Sleep/wake | Reconcile based on `endTimestampMs`. If wake time past end, transition to finished. |
| Multi-monitor | Clamp window position to visible bounds on restore. |
| Audio device failure | Fail silently + show a small warning indicator in UI. |
| Rapid input | Debounce to prevent double state transitions. |
| Running + duration edits | Ruler disabled unless `Idle` (V1). |

---

## 14. Milestones

1. App shell + always-on-top window + UI scaffolding.
2. Core timer + states (idle / running / paused / finished for both Work and Break).
3. Ruler interaction + Work/Break selection logic.
4. Persistence (settings + window bounds).
5. Theme follow system + override.
6. Audio tones + mute/volume.
7. Keyboard shortcuts.
8. Packaging for Windows.
9. Polish (a11y, tests, UX refinements).

---

## 15. Acceptance Criteria (V1)

- [ ] Always-on-top window behaves reliably.
- [ ] Ruler sets Work/Break minutes via drag and scroll; deselected interaction auto-selects Work.
- [ ] Timer is accurate across sleep/wake.
- [ ] Work and Break completion tones play once and can be muted.
- [ ] Theme follows system and can be overridden.
- [ ] All sizing uses rems and UI scale works.
- [ ] Settings and window bounds persist.
- [ ] Core timer and ruler logic are unit-tested.
