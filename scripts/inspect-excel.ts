import XLSX from 'xlsx';

const EXCEL_FILE = './Singin and Pickin.xlsx';

const workbook = XLSX.readFile(EXCEL_FILE);
console.log('Sheets:', workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
  console.log(`\n=== ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];

  // Get raw data with headers
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  console.log('First 5 rows:');
  for (let i = 0; i < Math.min(5, rawData.length); i++) {
    console.log(`Row ${i}:`, rawData[i]);
  }
}
