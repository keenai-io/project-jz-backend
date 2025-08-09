import * as XLSX from 'xlsx';
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

/**
 * Processes an Excel file using xlsx library and converts it to RowData format
 * 
 * @param file - Excel file to process
 * @returns Promise that resolves to array of RowData objects with column letters as keys
 * @throws Error if file processing fails
 */
export default async function ProcessSpeedgoXlsx(file: File): Promise<RowData[]> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Read the workbook from ArrayBuffer
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellText: false,  // Keep original cell values
      cellDates: true   // Parse dates properly
    });
    
    // Get the first worksheet (usually the main data sheet)
    const worksheetName = workbook.SheetNames[0];
    if (!worksheetName) {
      throw new Error('No worksheets found in the Excel file');
    }
    
    const worksheet = workbook.Sheets[worksheetName];
    if (!worksheet) {
      throw new Error(`Worksheet '${worksheetName}' not found in the Excel file`);
    }
    
    // Convert worksheet to JSON array (array of arrays)
    const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { 
      header: 1,        // Return array of arrays instead of objects
      defval: '',       // Default value for empty cells
      blankrows: false,  // Include blank rows
      raw: false        // Convert all values to strings for consistency
    });
    
    if (jsonData.length === 0) {
      return [];
    }
    
    // Determine the maximum number of columns from all rows
    const maxColumns = Math.max(...jsonData.map(row => Array.isArray(row) ? row.length : 0));
    const headers = Array.from({length: maxColumns}, (_, i) => getColumnLetter(i));

    // Map rows to objects with column letters as keys (matching original format)
    const data: RowData[] = jsonData.map(row => {
      const rowArray = Array.isArray(row) ? row : [];
      const rowObj: RowData = {};
      
      headers.forEach((header, index) => {
        // Convert cell value to string, handling various types
        const cellValue = rowArray[index];
        if (cellValue === null || cellValue === undefined) {
          rowObj[header] = '';
        } else if (typeof cellValue === 'object' && cellValue instanceof Date) {
          // Handle Date objects
          rowObj[header] = cellValue.toISOString().split('T')[0] || ''; // YYYY-MM-DD format
        } else {
          rowObj[header] = String(cellValue);
        }
      });
      
      return rowObj;
    });

    return data;
    
  } catch (error) {
    const errorObj = error instanceof Error 
      ? new Error(`Excel file processing failed: ${error.message}`) 
      : new Error('Unknown file processing error');
    throw errorObj;
  }
}
