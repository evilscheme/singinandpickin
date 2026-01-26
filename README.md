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

```yaml
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
---

Optional notes about the song go here.
```

3. Deploy:

```bash
npm run build && netlify deploy --prod --dir=dist
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploying

### Manual Deploy

```bash
npm run build && netlify deploy --prod --dir=dist
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

## Adding Cover Art

1. Add image to `public/covers/` (recommended: 400x400 JPG or WebP)
2. Reference in frontmatter: `coverImage: "/covers/2026-march-song.jpg"`

If no cover image is provided, a placeholder with the song title is displayed.

## Tech Stack

- **Astro** - Static site generator
- **Tailwind CSS** - Styling
- **Netlify** - Hosting and deployment
