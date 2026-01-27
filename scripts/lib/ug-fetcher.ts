/**
 * Fetch tabs from Ultimate Guitar
 *
 * Uses the ultimate-guitar npm package
 */

import { fetchChords, searchSong, category } from 'ultimate-guitar';

export interface TabData {
  title: string;
  artist: string;
  key?: string;
  content: string;
  url?: string;
}

/**
 * Fetch a tab from Ultimate Guitar URL
 */
export async function fetchFromUG(url: string): Promise<TabData> {
  try {
    const result = await fetchChords(url);

    if (result.status !== 200) {
      throw new Error(`Failed to fetch tab: status ${result.status}`);
    }

    const response = result.response;

    // Extract content - may be in different formats
    let content = '';
    if (typeof response === 'string') {
      content = response;
    } else if (response && typeof response.content === 'string') {
      content = response.content;
    } else if (response && response.wiki_tab) {
      // Some tabs come as wiki_tab content
      content = response.wiki_tab.content || '';
    } else {
      // Try to extract any text content
      content = JSON.stringify(response, null, 2);
    }

    // Parse the URL to get artist and song info
    const urlInfo = parseUGUrl(url);

    return {
      title: response?.song_name || urlInfo?.song || 'Unknown Title',
      artist: response?.artist_name || urlInfo?.artist || 'Unknown Artist',
      key: response?.tonality_name || extractKeyFromContent(content),
      content,
      url,
    };
  } catch (err) {
    throw new Error(
      `Could not fetch from Ultimate Guitar: ${err instanceof Error ? err.message : err}`
    );
  }
}

/**
 * Search for a song on Ultimate Guitar
 */
export async function searchUG(
  title: string,
  artist?: string
): Promise<Array<{ title: string; artist: string; url: string; rating: number; type: string }>> {
  try {
    const result = await searchSong(title, artist || null, category.CHORDS);

    if (result.status !== 200 || !result.responses) {
      return [];
    }

    // Map results to simpler format
    const responses = Array.isArray(result.responses) ? result.responses : [result.responses];
    return responses.map((item: any) => ({
      title: item.song_name,
      artist: item.artist_name,
      url: item.tab_url,
      rating: item.rating || 0,
      type: item.type || 'Chords',
    }));
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}

/**
 * Try to extract key from tab content
 */
function extractKeyFromContent(content: string): string | undefined {
  // Look for "Key:" line
  const keyMatch = content.match(/^key:\s*([A-G][#b]?m?)/im);
  if (keyMatch) return keyMatch[1];

  // Look for key in metadata format
  const metaKeyMatch = content.match(/\[Key:\s*([A-G][#b]?m?)\]/i);
  if (metaKeyMatch) return metaKeyMatch[1];

  // Look for tonality
  const tonalityMatch = content.match(/tonality[:\s]+([A-G][#b]?m?)/i);
  if (tonalityMatch) return tonalityMatch[1];

  return undefined;
}

/**
 * Parse tab ID from UG URL
 */
export function parseUGUrl(url: string): { artist: string; song: string; id: string } | null {
  // Format: https://tabs.ultimate-guitar.com/tab/artist-name/song-name-chords-123456
  const match = url.match(
    /tabs\.ultimate-guitar\.com\/tab\/([^\/]+)\/([^\/]+?)(?:-(?:chords|tabs|tab|bass|ukulele))?-(\d+)/i
  );
  if (!match) return null;

  // Convert dashes to spaces and capitalize words
  const formatName = (str: string) =>
    str
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    artist: formatName(match[1]),
    song: formatName(match[2]),
    id: match[3],
  };
}

/**
 * Validate that a URL is from Ultimate Guitar
 */
export function isUGUrl(url: string): boolean {
  return url.includes('ultimate-guitar.com');
}
