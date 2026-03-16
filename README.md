# sswagtho music player

A personal web music player built with Next.js, featuring a video background, playlist management, and a clean glassmorphism UI.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **CSS Modules** — scoped styles with glassmorphism theme
- **Web Audio API** — audio context and analyser node

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

## Project Structure

```
app/
├── api/
│   ├── login/route.ts       # Password auth (env var)
│   └── songs/route.ts       # Reads data/songs.json
├── musica/
│   ├── components/
│   │   └── UIComponents.tsx # Playlist, Controls, ProgressBar, VolumeControl, etc.
│   ├── hooks/
│   │   └── useAudioPlayer.ts# Audio + video player logic
│   ├── style/               # CSS Modules
│   ├── types.ts             # Shared Song interface
│   └── page.tsx             # Main player page
├── globals.css
├── layout.tsx
└── page.tsx                 # Login page
data/
└── songs.json               # Song catalog
```
