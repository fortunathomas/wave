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

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` file at the root:

```env
SITE_PASSWORD=yourpassword
```

On Vercel: **Settings → Environment Variables → `SITE_PASSWORD`**

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding Songs

Edit [data/songs.json](data/songs.json). Each song entry:

```json
{
  "_id": "unique-id",
  "title": "Song title",
  "artist": "Artist name",
  "producer": "Producer",
  "album": "Album name",
  "coverImage": "/images/cover.png",
  "visualVideo": "/canvas/video.mp4",
  "file": "/music/song.mp3",
  "duration": "3:45",
  "order": 1
}
```

Place audio/image/video files in the `public/` folder.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
