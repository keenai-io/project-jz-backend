import readXlsxFile from "read-excel-file";
// Note: This file is imported by client components, so we can't use server logger here

type RowData = Record<string, string>;

function getColumnLetter(index: number): string {
  // Convert 0-based index to letters: 0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA, etc.
  let letter = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

export default async function ProcessSpeedgoXlsx(file: File): Promise<RowData[]> {
  try {
    const rows = await readXlsxFile(file);
    const headers = Array.from({length: rows[0]?.length || 0}, (_, i) => getColumnLetter(i));

    // Map rows to objects with keys as letters
    const data: RowData[] = rows.map(row => {
      const rowObj: RowData = {};
      headers.forEach((header, index) => {
        rowObj[header] = String(row[index] || '');
      });
      return rowObj;
    });

    return data;
    
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown file processing error');
    throw errorObj;
  }
}
