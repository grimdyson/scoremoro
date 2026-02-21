# Sound Assets

Drop your timer sound effect here. The app expects:

| File | When it plays |
|------|---------------|
| `timer-finish.mp3` | Auto-plays when a work or break timer reaches zero |

Supported formats: `.mp3`, `.ogg`, `.wav`

To change the filename, update the path in `src/app/App.tsx` where `useTimerSound` is called.
