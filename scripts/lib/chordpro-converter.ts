/**
 * Convert Ultimate Guitar tab format to ChordPro format
 *
 * UG Format (chords above lyrics):
 *   Am                G
 *   Oh the cuckoo she's a pretty bird
 *
 * ChordPro Format (inline chords):
 *   [Am]Oh the cuckoo [G]she's a pretty bird
 */

// Common chord patterns to detect chord-only lines
const CHORD_PATTERN =
  /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|7|9|11|13|6|2|4|5|M|\/[A-G][#b]?)*$/;

/**
 * Check if a line contains only chord symbols
 */
function isChordLine(line: string): boolean {
  if (!line.trim()) return false;

  // Split by whitespace and check if all non-empty parts look like chords
  const parts = line.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length === 0) return false;

  // At least 60% of parts should be chords for it to be a chord line
  const chordParts = parts.filter((part) => CHORD_PATTERN.test(part));
  return chordParts.length / parts.length >= 0.6;
}

/**
 * Check if a line is a section header like [Verse 1] or [Chorus]
 */
function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  return /^\[.+\]$/.test(trimmed);
}

/**
 * Convert a section header from [Verse 1] to {Verse 1}
 */
function convertSectionHeader(line: string): string {
  const trimmed = line.trim();
  const content = trimmed.slice(1, -1); // Remove [ and ]
  return `{${content}}`;
}

/**
 * Parse chord positions from a chord line
 * Returns array of { chord, position } objects
 */
function parseChordPositions(
  chordLine: string
): Array<{ chord: string; position: number }> {
  const chords: Array<{ chord: string; position: number }> = [];
  let currentPos = 0;

  // Walk through the line character by character
  let i = 0;
  while (i < chordLine.length) {
    // Skip whitespace
    if (chordLine[i] === ' ' || chordLine[i] === '\t') {
      i++;
      currentPos++;
      continue;
    }

    // Found start of a chord - extract it
    let chord = '';
    const startPos = currentPos;
    while (i < chordLine.length && chordLine[i] !== ' ' && chordLine[i] !== '\t') {
      chord += chordLine[i];
      i++;
      currentPos++;
    }

    if (chord && CHORD_PATTERN.test(chord)) {
      chords.push({ chord, position: startPos });
    }
  }

  return chords;
}

/**
 * Merge a chord line with the following lyric line
 */
function mergeChordAndLyricLine(chordLine: string, lyricLine: string): string {
  const chords = parseChordPositions(chordLine);
  if (chords.length === 0) return lyricLine;

  // Build the result by inserting chords at their positions
  let result = '';
  let lyricIndex = 0;

  // Sort chords by position (should already be sorted, but be safe)
  chords.sort((a, b) => a.position - b.position);

  for (const { chord, position } of chords) {
    // Add lyrics up to the chord position
    while (lyricIndex < position && lyricIndex < lyricLine.length) {
      result += lyricLine[lyricIndex];
      lyricIndex++;
    }

    // If we haven't reached the position yet (lyric line is shorter), add spaces
    while (lyricIndex < position) {
      result += ' ';
      lyricIndex++;
    }

    // Insert the chord
    result += `[${chord}]`;
  }

  // Add remaining lyrics
  while (lyricIndex < lyricLine.length) {
    result += lyricLine[lyricIndex];
    lyricIndex++;
  }

  return result;
}

export interface ConversionResult {
  chordpro: string;
  metadata: {
    key?: string;
    capo?: string;
  };
}

/**
 * Convert Ultimate Guitar tab content to ChordPro format
 */
export function convertToChordPro(ugContent: string): ConversionResult {
  // Normalize line endings - remove \r characters
  const normalizedContent = ugContent.replace(/\r/g, '');
  const lines = normalizedContent.split('\n');
  const outputLines: string[] = [];
  const metadata: { key?: string; capo?: string } = {};

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines but preserve them in output
    if (!trimmed) {
      outputLines.push('');
      i++;
      continue;
    }

    // Check for metadata lines at the start
    const keyMatch = trimmed.match(/^key:\s*(.+)$/i);
    if (keyMatch) {
      metadata.key = keyMatch[1].trim();
      i++;
      continue;
    }

    const capoMatch = trimmed.match(/^capo:?\s*(\d+)/i);
    if (capoMatch) {
      metadata.capo = capoMatch[1];
      i++;
      continue;
    }

    // Check for section headers
    if (isSectionHeader(trimmed)) {
      outputLines.push(convertSectionHeader(trimmed));
      i++;
      continue;
    }

    // Check if this is a chord line
    if (isChordLine(trimmed)) {
      // Look ahead for the next non-empty line
      let nextLineIndex = i + 1;
      while (nextLineIndex < lines.length && !lines[nextLineIndex].trim()) {
        nextLineIndex++;
      }

      const nextLine = lines[nextLineIndex];

      // If there's a next line and it's not a chord line or section header, merge them
      if (
        nextLine &&
        !isChordLine(nextLine.trim()) &&
        !isSectionHeader(nextLine.trim())
      ) {
        const merged = mergeChordAndLyricLine(line, nextLine);
        outputLines.push(merged);
        i = nextLineIndex + 1;
      } else {
        // Chord-only line (like for an instrumental section)
        // Convert to a line of just chord markers
        const chords = parseChordPositions(line);
        if (chords.length > 0) {
          outputLines.push(chords.map((c) => `[${c.chord}]`).join(' '));
        }
        i++;
      }
      continue;
    }

    // Regular lyric line without chords
    outputLines.push(trimmed);
    i++;
  }

  // Clean up: remove leading/trailing empty lines, reduce multiple blank lines to one
  let chordpro = outputLines.join('\n');
  chordpro = chordpro.replace(/\n{3,}/g, '\n\n').trim();

  return { chordpro, metadata };
}

/**
 * Extract key from tab content if present
 */
export function extractKey(content: string): string | undefined {
  // Look for "Key:" at the start of lines
  const keyMatch = content.match(/^key:\s*([A-G][#b]?m?)/im);
  if (keyMatch) return keyMatch[1];

  // Look for "Capo" mentions that might indicate key
  // This is less reliable, so only use if no explicit key

  return undefined;
}
