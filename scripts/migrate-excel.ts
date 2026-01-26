import XLSX from 'xlsx';
import fs from 'fs';

const EXCEL_FILE = './Singin and Pickin.xlsx';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatMonth(month: string | number): string {
  // Handle Excel serial dates (number of days since Jan 1, 1900)
  if (typeof month === 'number') {
    const date = XLSX.SSF.parse_date_code(month);
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[date.m - 1] || 'January';
  }

  const monthStr = String(month).trim().toLowerCase();
  const monthMap: Record<string, string> = {
    jan: 'January', january: 'January', feburary: 'February',
    feb: 'February', february: 'February',
    mar: 'March', march: 'March',
    apr: 'April', april: 'April',
    may: 'May',
    jun: 'June', june: 'June',
    jul: 'July', july: 'July',
    aug: 'August', august: 'August',
    sep: 'September', sept: 'September', september: 'September',
    oct: 'October', october: 'October',
    nov: 'November', november: 'November',
    dec: 'December', december: 'December',
  };
  return monthMap[monthStr] || 'January';
}

function getMonthNumber(month: string): number {
  const months: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  return months[month.toLowerCase()] || 1;
}

function parseSongTitle(songCell: string): { title: string; artist: string } {
  // Handle formats like:
  // "The Baton by Katie Gavin"
  // '"The Cuckoo" by Hem'
  // "Under African Skies"
  // "Long Time Gone by Darrell Scott"

  const text = songCell.replace(/^[""]|[""]$/g, '').trim();

  // Try "Song by Artist" pattern
  const byMatch = text.match(/^(.+?)\s+by\s+(.+)$/i);
  if (byMatch) {
    return {
      title: byMatch[1].replace(/^[""]|[""]$/g, '').trim(),
      artist: byMatch[2].trim(),
    };
  }

  // No artist found
  return { title: text, artist: 'Traditional' };
}

function extractYouTubeUrl(modelCell: string): string | undefined {
  if (!modelCell || modelCell.toLowerCase() === 'see printable') return undefined;

  // Extract URL from text like "The Cuckoo (Remastered 2025) - YouTube"
  // or direct URLs
  const urlMatch = modelCell.match(/(https?:\/\/[^\s]+)/);
  return urlMatch ? urlMatch[1] : undefined;
}

function yamlValue(value: string | number | undefined): string {
  if (value === undefined || value === '') return '""';
  const str = String(value);
  if (str.includes(':') || str.includes('"') || str.includes("'") || str.includes('#') || str.includes('\n')) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return `"${str}"`;
}

async function migrate() {
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(EXCEL_FILE);

  const yearSheets = ['2026', '2025', '2024', '2023', '2022', '2021'].filter(
    (year) => workbook.SheetNames.includes(year)
  );

  console.log('Year sheets found:', yearSheets);

  let totalSongs = 0;

  for (const yearStr of yearSheets) {
    const year = parseInt(yearStr, 10);
    const sheet = workbook.Sheets[yearStr];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });

    console.log(`\n=== Processing ${year} ===`);

    // Skip header rows (row 0 is Spotify link, row 1 is column headers)
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row[1] || String(row[1]).trim() === '') continue; // Skip empty song rows

      const monthRaw = row[0];
      const songCell = String(row[1]).trim();
      const keyCell = String(row[2]).trim();
      const modelCell = String(row[3]).trim();
      const chordsCell = String(row[4]).trim();
      const printableCell = String(row[5]).trim();
      const pickerCell = String(row[6] || '').trim();
      const notesCell = String(row[7] || '').trim();

      const month = formatMonth(monthRaw);
      const monthNum = getMonthNumber(month);
      const { title, artist } = parseSongTitle(songCell);
      const youtubeUrl = extractYouTubeUrl(modelCell);

      const slug = slugify(`${month}-${title}`);
      const date = `${year}-${String(monthNum).padStart(2, '0')}-01`;

      // Build frontmatter
      let frontmatter = `---
title: ${yamlValue(title)}
artist: ${yamlValue(artist)}
date: ${date}
month: ${yamlValue(month)}
year: ${year}
picker: ${yamlValue(pickerCell || 'Unknown')}`;

      if (keyCell) frontmatter += `\nkey: ${yamlValue(keyCell)}`;
      if (youtubeUrl) frontmatter += `\nyoutubeUrl: ${yamlValue(youtubeUrl)}`;
      if (chordsCell && chordsCell.startsWith('http')) {
        frontmatter += `\nchordsUrl: ${yamlValue(chordsCell)}`;
      }
      if (printableCell && printableCell.startsWith('http')) {
        frontmatter += `\nprintableUrl: ${yamlValue(printableCell)}`;
      }

      frontmatter += '\n---\n';

      // Add notes as content if present
      if (notesCell) {
        frontmatter += `\n${notesCell}\n`;
      }

      // Ensure directory exists
      const dirPath = `./src/content/songs/${year}`;
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Write file
      const filePath = `${dirPath}/${slug}.md`;
      fs.writeFileSync(filePath, frontmatter);
      console.log(`Created: ${filePath} - ${title}`);
      totalSongs++;
    }
  }

  console.log(`\nTotal songs created: ${totalSongs}`);

  // Process Holiday Carols
  const carolsSheetName = workbook.SheetNames.find((name) =>
    name.toLowerCase().includes('carol') || name.toLowerCase().includes('holiday')
  );

  if (carolsSheetName) {
    console.log(`\n=== Processing Holiday Carols ===`);
    const sheet = workbook.Sheets[carolsSheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });

    const dirPath = './src/content/holiday-carols';
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let carolCount = 0;

    // Skip first two rows (headers and master link)
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      const picker = String(row[0] || '').trim();
      const titleCell = String(row[1] || '').trim();
      const exampleCell = String(row[2] || '').trim();
      const chordsCell = String(row[3] || '').trim();

      if (!titleCell || titleCell === '') continue;

      // Extract YouTube URL from example cell (might have description text)
      const youtubeMatch = exampleCell.match(/(https?:\/\/[^\s]+)/);
      const youtubeUrl = youtubeMatch ? youtubeMatch[1] : undefined;

      const slug = slugify(titleCell);

      let frontmatter = `---
title: ${yamlValue(titleCell)}
order: ${carolCount + 1}`;

      if (picker) frontmatter += `\npicker: ${yamlValue(picker)}`;
      if (youtubeUrl) frontmatter += `\nyoutubeUrl: ${yamlValue(youtubeUrl)}`;
      if (chordsCell && chordsCell.startsWith('http')) {
        frontmatter += `\nchordsUrl: ${yamlValue(chordsCell)}`;
      }

      frontmatter += '\n---\n';

      const filePath = `${dirPath}/${slug}.md`;
      fs.writeFileSync(filePath, frontmatter);
      console.log(`Created: ${filePath} - ${titleCell}`);
      carolCount++;
    }

    console.log(`\nTotal carols created: ${carolCount}`);
  }

  console.log('\nMigration complete!');
}

migrate().catch(console.error);
