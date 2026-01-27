#!/usr/bin/env npx tsx

/**
 * Import Ultimate Guitar tabs into the song collection
 *
 * Usage:
 *   npm run import-tab https://tabs.ultimate-guitar.com/tab/artist/song-chords-123456
 *   npm run import-tab --paste
 *   npm run import-tab --stdout <url>   # Output to stdout instead of file
 */

import fs from 'fs';
import readline from 'readline';
import { fetchFromUG, isUGUrl, parseUGUrl, type TabData } from './lib/ug-fetcher.js';
import { convertToChordPro } from './lib/chordpro-converter.js';
import {
  slugify,
  yamlValue,
  getMonthNumber,
  MONTHS,
} from './lib/song-utils.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionWithDefault(prompt: string, defaultValue: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${prompt} [${defaultValue}]: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function selectMonth(): Promise<string> {
  console.log('\nSelect month:');
  MONTHS.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));

  const currentMonth = new Date().getMonth() + 1;
  const answer = await questionWithDefault('Month number', String(currentMonth));
  const monthNum = parseInt(answer, 10);

  if (monthNum >= 1 && monthNum <= 12) {
    return MONTHS[monthNum - 1];
  }
  return MONTHS[currentMonth - 1];
}

async function readMultilineInput(): Promise<string> {
  console.log('\nPaste tab content below (press Enter twice when done):');
  console.log('---');

  return new Promise((resolve) => {
    let content = '';
    let emptyLineCount = 0;

    const lineHandler = (line: string) => {
      if (line === '') {
        emptyLineCount++;
        if (emptyLineCount >= 2) {
          rl.removeListener('line', lineHandler);
          resolve(content.trim());
          return;
        }
      } else {
        emptyLineCount = 0;
      }
      content += line + '\n';
    };

    rl.on('line', lineHandler);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const stdoutMode = args.includes('--stdout') || args.includes('-o');
  const filteredArgs = args.filter((a) => a !== '--stdout' && a !== '-o');

  // Stdout mode - just fetch and output ChordPro, no prompts
  if (stdoutMode) {
    const url = filteredArgs.find((a) => isUGUrl(a));
    if (!url) {
      console.error('Usage: npm run import-tab --stdout <url>');
      process.exit(1);
    }

    try {
      console.error('Fetching tab...');
      const tabData = await fetchFromUG(url);
      console.error(`Title: ${tabData.title}`);
      console.error(`Artist: ${tabData.artist}`);
      if (tabData.key) console.error(`Key: ${tabData.key}`);
      console.error('---');

      const { chordpro } = convertToChordPro(tabData.content);
      console.log(chordpro);
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
    process.exit(0);
  }

  let tabData: TabData;

  // Check for --paste flag
  if (filteredArgs.includes('--paste') || filteredArgs.includes('-p')) {
    // Manual paste mode
    const title = await question('Song title: ');
    const artist = await question('Artist: ');
    const content = await readMultilineInput();

    tabData = { title, artist, content };
  } else if (filteredArgs.length > 0 && isUGUrl(filteredArgs[0])) {
    // URL mode
    const url = filteredArgs[0];
    console.log(`\nFetching tab from Ultimate Guitar...`);

    try {
      tabData = await fetchFromUG(url);
      console.log('\nFetched successfully!');
    } catch (err) {
      console.error(`\nError fetching tab: ${err instanceof Error ? err.message : err}`);
      console.log('\nTrying to extract info from URL...');

      // Try to get basic info from URL
      const urlInfo = parseUGUrl(url);
      if (urlInfo) {
        console.log(`  Artist (from URL): ${urlInfo.artist}`);
        console.log(`  Song (from URL): ${urlInfo.song}`);
        console.log('\nPlease paste the tab content manually.');

        const title = await questionWithDefault('Song title', urlInfo.song);
        const artist = await questionWithDefault('Artist', urlInfo.artist);
        const content = await readMultilineInput();

        tabData = { title, artist, content, url };
      } else {
        // Complete manual mode
        console.log('\nCould not parse URL. Please enter info manually:');
        const title = await question('Song title: ');
        const artist = await question('Artist: ');
        const content = await readMultilineInput();

        tabData = { title, artist, content, url };
      }
    }
  } else {
    // No URL provided - show usage
    console.log(`
Ultimate Guitar Tab Importer

Usage:
  npm run import-tab <url>          Fetch and import from Ultimate Guitar URL
  npm run import-tab --paste        Manually paste tab content
  npm run import-tab --stdout <url> Output ChordPro to stdout (no file created)

Options:
  -p, --paste   Manually paste tab content
  -o, --stdout  Output to stdout instead of creating file

Examples:
  npm run import-tab https://tabs.ultimate-guitar.com/tab/hem/the-cuckoo-chords-4846394
  npm run import-tab -o https://tabs.ultimate-guitar.com/tab/hem/the-cuckoo-chords-4846394
  npm run import-tab -p
`);
    rl.close();
    process.exit(0);
  }

  // Display fetched info
  console.log('\n--- Tab Info ---');
  console.log(`  Title: ${tabData.title}`);
  console.log(`  Artist: ${tabData.artist}`);
  if (tabData.key) console.log(`  Key: ${tabData.key}`);
  if (tabData.url) console.log(`  URL: ${tabData.url}`);

  // Allow editing
  const confirm = await question('\nUse this info? (y/n/edit): ');
  if (confirm.toLowerCase() === 'n') {
    console.log('Cancelled.');
    rl.close();
    process.exit(0);
  }

  if (confirm.toLowerCase() === 'edit' || confirm.toLowerCase() === 'e') {
    tabData.title = await questionWithDefault('Title', tabData.title);
    tabData.artist = await questionWithDefault('Artist', tabData.artist);
    tabData.key = await questionWithDefault('Key', tabData.key || '') || undefined;
  }

  // Get additional fields
  console.log('\n--- Additional Info ---');
  const picker = await question('Picker (who chose this song): ');
  const month = await selectMonth();
  const year = await questionWithDefault('Year', String(new Date().getFullYear()));
  const youtubeUrl = await question('YouTube URL (optional): ');

  // Convert to ChordPro
  console.log('\nConverting to ChordPro format...');
  const { chordpro, metadata } = convertToChordPro(tabData.content);

  // Use extracted key if not already set
  if (!tabData.key && metadata.key) {
    tabData.key = metadata.key;
  }

  // Generate filename and path
  const monthNum = getMonthNumber(month);
  const date = `${year}-${String(monthNum).padStart(2, '0')}-01`;
  const slug = slugify(`${month}-${tabData.title}`);
  const dirPath = `./src/content/songs/${year}`;
  const filePath = `${dirPath}/${slug}.md`;

  // Build frontmatter
  let frontmatter = `---
title: ${yamlValue(tabData.title)}
artist: ${yamlValue(tabData.artist)}
date: ${date}
month: ${yamlValue(month)}
year: ${year}
picker: ${yamlValue(picker || 'Unknown')}`;

  if (tabData.key) frontmatter += `\nkey: ${yamlValue(tabData.key)}`;
  if (youtubeUrl) frontmatter += `\nyoutubeUrl: ${yamlValue(youtubeUrl)}`;
  if (tabData.url) frontmatter += `\nchordsUrl: ${yamlValue(tabData.url)}`;
  if (metadata.capo) frontmatter += `\ncapo: ${metadata.capo}`;

  frontmatter += '\n---\n';

  // Add ChordPro content
  const fullContent = `${frontmatter}
\`\`\`chordpro
${chordpro}
\`\`\`
`;

  // Preview
  console.log('\n--- File Preview ---');
  console.log(`Path: ${filePath}`);
  console.log('---');
  console.log(fullContent.slice(0, 1000));
  if (fullContent.length > 1000) {
    console.log(`... (${fullContent.length - 1000} more characters)`);
  }
  console.log('---');

  // Confirm and save
  const saveConfirm = await question('\nSave this file? (y/n): ');
  if (saveConfirm.toLowerCase() !== 'y') {
    console.log('Cancelled. File not saved.');
    rl.close();
    process.exit(0);
  }

  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    const overwrite = await question('File already exists. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Cancelled. File not saved.');
      rl.close();
      process.exit(0);
    }
  }

  // Write file
  fs.writeFileSync(filePath, fullContent);
  console.log(`\nSaved: ${filePath}`);
  console.log(`\nPreview at: http://localhost:4321/songs/${year}/${slug}`);
  console.log('(Run "npm run dev" to start the dev server)');

  rl.close();
}

main().catch((err) => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});
