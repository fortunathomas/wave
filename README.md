# sswagtho music player

A personal web music player built with Next.js, featuring a video background, playlist management, and a clean glassmorphism UI.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **MongoDB / Mongoose** — song catalog and authentication
- **Web Audio API** — audio context and analyser node
- **TypeScript**
- **CSS Modules** — scoped styles with glassmorphism theme

## Features

- Password-protected access
- Video background with reverse loop animation
- Playlist with animated playing indicator
- Track info modal (title, artist, producer, album, duration)
- Progress bar with seek
- Volume control with mute toggle and localStorage persistence
- Keyboard shortcuts: `Space` = play/pause, `←` / `→` = prev/next track
- Auto-advance to next track on end
- Responsive layout