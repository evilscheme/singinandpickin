# Claude Context for Singin' and Pickin'

## Project Overview
A static website for a monthly song-sharing gathering. Each month, one person picks a song and the group learns it together. This site serves as their digital songbook.

**Live URL**: https://singingandpicking.netlify.app
**Netlify Admin**: https://app.netlify.com/projects/singingandpicking

## Tech Stack
- **Astro** - Static site generator with content collections
- **Tailwind CSS** - Styling with custom warm color palette (amber, earth, sage)
- **Netlify** - Hosting (manual deploy, not connected to GitHub)

## Key Commands
```bash
npm run dev          # Start dev server at localhost:4321
npm run check        # Run TypeScript/Astro linting (no build)
npm run build        # Lint + build to dist/
npm run deploy       # Build and deploy to Netlify
```

## Content Structure

Songs are markdown files with YAML frontmatter in `src/content/songs/YEAR/`:

```
src/content/songs/
├── 2023/
├── 2024/
├── 2025/
└── 2026/
    └── february-the-cuckoo.md
```

### Song Frontmatter Template
```yaml
---
title: "Song Title"
artist: "Artist Name"
date: 2026-03-01        # YYYY-MM-01 format
month: "March"          # Full month name
year: 2026
picker: "Person's Name"
key: "G"                # Optional
youtubeUrl: "https://..." # Optional
chordsUrl: "https://..."  # Optional (Ultimate Guitar, etc.)
printableUrl: "https://..." # Optional (Google Docs, etc.)
spotifyUrl: "https://..."   # Optional
appleMusicUrl: "https://..." # Optional
coverImage: "/covers/filename.jpg" # Optional
---

Optional notes or ChordPro content here.
```

### Filename Convention
`month-song-title.md` in lowercase with hyphens, e.g., `march-white-flag.md`

## Pages & Routes
- `/` - Homepage with current (most recent) song hero + recent songs grid
- `/archive` - All songs grouped by year with year pills
- `/archive/[year]` - Songs filtered by year
- `/songs/[year]/[slug]` - Individual song pages

## Components
- `CurrentSongHero.astro` - Homepage hero for current month's song
- `SongCard.astro` - Song preview card with cover art placeholder
- `YouTubeEmbed.astro` - Lazy-loaded YouTube player
- `ChordChart.astro` - Renders ChordPro format (basic parser)
- `StreamingLinks.astro` - YouTube/Spotify/Chords/Printable buttons

## Design System
- **Colors**: Warm amber/honey (`amber-*`), earthy neutrals (`earth-*`), sage green (`sage-*`)
- **Fonts**: Lora (serif headings), Inter (body), JetBrains Mono (chords)
- **Cover placeholders**: Gradient backgrounds with music note emoji when no `coverImage`

## Data Migration
Original data came from `Singin and Pickin.xlsx`. Migration script at `scripts/migrate-excel.ts` (one-time use, kept for reference).

## Deployment Notes
- Netlify CLI is logged in locally
- Deploy with: `npm run build && netlify deploy --prod --dir=dist`
- No GitHub integration - manual deploys only
- Build output goes to `dist/`

## Common Tasks

### Add a new song
1. Create `src/content/songs/YEAR/month-title.md`
2. Add frontmatter (copy from existing song)
3. Deploy

### Change current featured song
The homepage automatically shows the most recent song by `date` field. To feature a different song, adjust its date to be the newest.

### Add cover art
1. Add image to `public/covers/` (400x400 recommended)
2. Reference in frontmatter: `coverImage: "/covers/filename.jpg"`

## Workflow Preference
**Always check and preview locally before committing.** Bryan prefers to:
1. Make changes
2. Run `npm run check` to verify no TypeScript/linting errors
3. Run `npm run dev` and preview at http://localhost:4321
4. Verify everything looks good
5. Then commit and deploy

Do NOT auto-commit or auto-deploy without prompting for local preview first.

**Keep builds clean** - fix any warnings before committing. Run `npm run check` to catch issues early.

## Gotchas
- The `date` field must be a valid date (YYYY-MM-DD format)
- Song slugs are derived from the filename, not the title
- ChordPro parsing is basic - complex directives may not render perfectly
- Netlify deploy runs the build command from `netlify.toml`
