# Singin' and Pickin'

A static website for our monthly song-sharing gathering. Built with Astro and Tailwind CSS, deployed on Netlify.

**Live site**: https://singingandpicking.netlify.app

## Adding a New Monthly Song

1. Create a new markdown file in `src/content/songs/YEAR/`:

```bash
# Example: March 2026 song
touch src/content/songs/2026/march-song-title.md
```

2. Copy this template into the file:

```markdown
---
title: "Song Title"
artist: "Artist Name"
date: 2026-03-01
month: "March"
year: 2026
picker: "Person's Name"
key: "G"
youtubeUrl: "https://youtu.be/..."
chordsUrl: "https://tabs.ultimate-guitar.com/..."
printableUrl: "https://docs.google.com/..."
spotifyUrl: "https://open.spotify.com/..."
appleMusicUrl: "https://music.apple.com/..."
coverImage: "/covers/2026-march-song.jpg"
extras:
  - title: "Isolated Harmony"
    url: "https://drive.google.com/file/d/FILE_ID/view"
    type: "audio"
---

```chordpro
{Verse 1}
[G]Here are the [C]lyrics with [D]chords above
[G]Each chord goes in [Em]square brackets

{Chorus}
[C]Section headers use [G]curly braces
```
```

3. Deploy:

```bash
npm run deploy
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Check for TypeScript/linting errors
npm run check

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploying

### Manual Deploy

```bash
npm run deploy
```

### Auto-Deploy (Optional)

To enable auto-deploy on git push:

1. Push this repo to GitHub
2. Go to https://app.netlify.com/projects/singingandpicking/configuration/deploys
3. Link to your GitHub repository
4. Future `git push` commands will auto-deploy

## Project Structure

```
src/
├── content/
│   └── songs/           # Monthly songs organized by year
│       ├── 2023/
│       ├── 2024/
│       ├── 2025/
│       └── 2026/
├── components/          # Reusable UI components
├── layouts/             # Page layouts
├── pages/               # Route pages
└── styles/              # Global CSS
```

## Frontmatter Reference

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Song title |
| `artist` | Yes | Artist/band name |
| `date` | Yes | Date in YYYY-MM-01 format |
| `month` | Yes | Full month name (e.g., "January") |
| `year` | Yes | Four-digit year |
| `picker` | Yes | Who picked this song |
| `key` | No | Musical key (e.g., "G", "Am") |
| `youtubeUrl` | No | YouTube link to model recording |
| `chordsUrl` | No | Link to chord chart (Ultimate Guitar, etc.) |
| `printableUrl` | No | Link to printable sheet (Google Docs, etc.) |
| `spotifyUrl` | No | Spotify link |
| `appleMusicUrl` | No | Apple Music link |
| `coverImage` | No | Path to cover art (e.g., "/covers/image.jpg") |
| `extras` | No | Array of additional resources (see below) |

## Cover Art

Cover art is displayed automatically in this priority:

1. **Custom image**: Set `coverImage: "/covers/2026-march-song.jpg"` and add the image to `public/covers/`
2. **YouTube thumbnail**: Auto-fetched from `youtubeUrl` if no custom image is set
3. **Placeholder**: Shows song title and artist on a gradient background

For custom images, 400x400 JPG or WebP is recommended.

## Adding Chords (ChordPro Format)

Add a `chordpro` code block in the markdown body to display chords inline with lyrics:

```markdown
```chordpro
{Verse 1}
[G]Here are the [C]lyrics with [D]chords
[Em]Chords appear [Am]above the [D]words

{Chorus}
[C]Use curly braces for [G]section headers
```
```

The chords will be rendered with proper styling and alignment.

## Adding Extras (Alternate Mixes, Isolated Tracks, etc.)

Add an `extras` array in the frontmatter for additional audio/video resources:

```yaml
extras:
  - title: "Isolated Harmony"
    url: "https://drive.google.com/file/d/FILE_ID/view"
    type: "audio"
  - title: "Practice Video"
    url: "https://drive.google.com/file/d/FILE_ID/view"
    type: "video"
```

Supported sources:
- **Google Drive**: Audio files get an embedded player; video files get an iframe
- **SoundCloud**: Native embedded player
- **Other URLs**: Shown as download links

## Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Styling
- **Netlify** - Hosting and deployment
