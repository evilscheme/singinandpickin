import type { CollectionEntry } from 'astro:content';
import { getYouTubeThumbnail } from './youtube';

export type Song = CollectionEntry<'songs'>;

export function songSlug(song: Song): string {
  return `${song.data.year}/${song.id.split('/').pop()}`;
}

/** Resolved cover image: explicit `coverImage` wins, else YouTube thumbnail, else undefined. */
export function songCover(song: Song): string | undefined {
  if (song.data.coverImage) return song.data.coverImage;
  if (song.data.youtubeUrl) return getYouTubeThumbnail(song.data.youtubeUrl) ?? undefined;
  return undefined;
}

export function sortByDateDesc(songs: Song[]): Song[] {
  return [...songs].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/**
 * Issue number: 1-based position in date-ascending order, zero-padded to 3 digits.
 * Computed on the fly so backdating a song re-numbers everything consistently.
 */
export function issueNo(song: Song, allSongs: Song[]): string {
  const ascending = [...allSongs].sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const index = ascending.findIndex((s) => s.id === song.id);
  return String(index + 1).padStart(3, '0');
}

/**
 * Auto-scale homepage hero title to keep visual "balance":
 *   ≤10 chars → 96 / 0.95
 *   ≤16 chars → 76 / 1.0
 *   ≤22 chars → 60 / 1.0
 *   else      → 50 / 1.0
 */
export function heroTitleSize(title: string): { fontSize: number; lineHeight: number } {
  const len = title.length;
  if (len <= 10) return { fontSize: 96, lineHeight: 0.95 };
  if (len <= 16) return { fontSize: 76, lineHeight: 1.0 };
  if (len <= 22) return { fontSize: 60, lineHeight: 1.0 };
  return { fontSize: 50, lineHeight: 1.0 };
}

/** Solid fallback colors for archive cards (cycled by index). */
export const archiveCardPalette = ['#c2a878', '#8a6a4a', '#3d3a52', '#7a5230'];
