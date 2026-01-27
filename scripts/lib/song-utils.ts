/**
 * Shared utilities for song scripts
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getMonthNumber(month: string): number {
  const months: Record<string, number> = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };
  return months[month.toLowerCase()] || 1;
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[monthNumber - 1] || 'January';
}

export function yamlValue(value: string | number | undefined): string {
  if (value === undefined || value === '') return '""';
  const str = String(value);
  if (
    str.includes(':') ||
    str.includes('"') ||
    str.includes("'") ||
    str.includes('#') ||
    str.includes('\n')
  ) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return `"${str}"`;
}

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
