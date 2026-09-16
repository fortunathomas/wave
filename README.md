# wave

'wav​e' is a web application designed to let users listen to music directly in the browser.  
The interface is modern and minimal, with all the essential playback controls such as play, pause, and track management.  
During playback, the app shows an animated version of the current track’s cover art: this animation makes the experience more immersive and creates a dynamic, pleasant atmosphere.

A personal web music player built with Next.js, featuring playlist management and a clean glassmorphism UI.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **CSS Modules**
- **Web Audio API**
  
## Features

- Player accessible directly (no gate/password)
- Animated visual/loop linked to the currently playing track
- Playlist with playback indicator
- Track info (title, artist, producer, album, duration)
- Progress bar with seeking
- Volume control with mute toggle and persistence in `localStorage`
- Keyboard shortcuts: `Space` = play/pause, `←` / `→` = previous/next track
- Automatic track advance at the end of playback
- Layout responsive

## Project structure

```text
app/
├── api/
│   └── songs/route.ts           # API: exposes songs from data/songs.json
├── components/                  # Player UI components (Playlist, Controls, modals, etc.)
├── player/
│   ├── hooks/                   # Player logic (audio/video)
│   └── styles/                  # Player CSS Modules
├── types.ts                     # Shared types (Song)
├── globals.css
├── layout.tsx
└── page.tsx                     # Entry/landing

data/
└── songs.json                   # Song catalog

scripts/
└── seedSongs.ts                 # Song catalog generation script
```

## Notes

- The `app/api/songs/route.ts` endpoint builds final media file URLs from the paths listed in `data/songs.json`.
