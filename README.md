# Spoiler — Music Player

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

## Project Structure

```
app/
├── api/
│   ├── login/route.ts       # Password auth (bcrypt)
│   └── songs/route.ts       # Fetch songs from MongoDB
├── lib/
│   └── mongodb.ts           # MongoDB connection
├── models/
│   ├── Song.ts              # Song schema
│   └── Password.ts          # Password schema
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
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` file at the root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Song Schema

Songs are stored in MongoDB with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Track title |
| `artist` | String | Artist name (default: `tho`) |
| `producer` | String | Optional producer credit |
| `album` | String | Optional album name |
| `coverImage` | String | Path to cover art |
| `visualVideo` | String | Path to background video |
| `file` | String | Path to audio file |
| `duration` | String | Display duration (e.g. `3:45`) |
| `order` | Number | Playlist sort order |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
