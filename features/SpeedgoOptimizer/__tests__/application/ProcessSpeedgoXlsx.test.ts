/**
 * @fileoverview Tests for ProcessSpeedgoXlsx function
 * @module features/SpeedgoOptimizer/__tests__/application/ProcessSpeedgoXlsx.test
 */

import { describe, it, expect, vi } from 'vitest';
import * as XLSX from 'xlsx';
import ProcessSpeedgoXlsx from '../../application/ProcessSpeedgoXlsx';

// Mock xlsx module
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

// Create a proper File mock with arrayBuffer method
class MockFile extends File {
  constructor(content: string[], filename: string, options: { type: string }) {
    super(content, filename, options);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    // Return a mock Excel content instead of just the filename
    const mockExcelContent = 'mock-excel-file-content-' + this.name;
    return encoder.encode(mockExcelContent).buffer;
  }
}

// Replace global File with our mock
global.File = MockFile as any;

/**
 * Test suite for ProcessSpeedgoXlsx function.
 * 
 * Tests Excel file processing, data conversion, and error handling.
 * Mocks XLSX library to ensure isolated unit tests.
 */
describe('ProcessSpeedgoXlsx', () => {
  const mockXLSX = XLSX as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests successful processing of Excel file with data.
   */
  it('should process Excel file successfully and return RowData array', async () => {
    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {
          A1: { v: 'Header1' },
          B1: { v: 'Header2' },
          A2: { v: 'Value1' },
          B2: { v: 'Value2' },
        },
      },
    };

    const mockJsonData = [
      ['Header1', 'Header2'],
      ['Value1', 'Value2'],
      ['Value3', 'Value4'],
    ];

    mockXLSX.read.mockReturnValue(mockWorkbook);
    mockXLSX.utils.sheet_to_json.mockReturnValue(mockJsonData);

    const result = await ProcessSpeedgoXlsx(mockFile);

    // Verify XLSX.read was called with correct parameters
    expect(mockXLSX.read).toHaveBeenCalledTimes(1);
    const [arrayBuffer, options] = mockXLSX.read.mock.calls[0];
    expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    expect(options).toEqual({
      type: 'array',
      cellText: false,
      cellDates: true,
    });

    expect(mockXLSX.utils.sheet_to_json).toHaveBeenCalledWith(
      mockWorkbook.Sheets.Sheet1,
      {
        header: 1,
        defval: '',
        blankrows: false,
        raw: false,
      }
    );

    expect(result).toEqual([
      { A: 'Header1', B: 'Header2' },
      { A: 'Value1', B: 'Value2' },
      { A: 'Value3', B: 'Value4' },
    ]);
  });

  /**
   * Tests processing empty Excel file.
   */
  it('should return empty array for empty Excel file', async () => {
    const mockFile = new File([''], 'empty.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    };

    mockXLSX.read.mockReturnValue(mockWorkbook);
    mockXLSX.utils.sheet_to_json.mockReturnValue([]);

    const result = await ProcessSpeedgoXlsx(mockFile);

    expect(result).toEqual([]);
  });

  /**
   * Tests error handling when no worksheets are found.
   */
  it('should throw error when no worksheets found', async () => {
    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const mockWorkbook = {
      SheetNames: [],
      Sheets: {},
    };

    mockXLSX.read.mockReturnValue(mockWorkbook);

    await expect(ProcessSpeedgoXlsx(mockFile)).rejects.toThrow(
      'No worksheets found in the Excel file'
    );
  });

  /**
   * Tests error handling when worksheet is not found.
   */
  it('should throw error when worksheet not found', async () => {
    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {},
    };

    mockXLSX.read.mockReturnValue(mockWorkbook);

    await expect(ProcessSpeedgoXlsx(mockFile)).rejects.toThrow(
      "Worksheet 'Sheet1' not found in the Excel file"
    );
  });

  /**
   * Tests error handling for XLSX library errors.
   */
  it('should handle XLSX errors and throw with descriptive message', async () => {
    const mockFile = new File(['invalid content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    mockXLSX.read.mockImplementation(() => {
      throw new Error('Invalid file format');
    });

    await expect(ProcessSpeedgoXlsx(mockFile)).rejects.toThrow(
      'Excel file processing failed: Invalid file format'
    );
  });

  /**
   * Tests handling of Date objects in cells.
   */
  it('should handle Date objects and convert to ISO date string', async () => {
    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const testDate = new Date('2023-12-25T10:30:00Z');
    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    };

    const mockJsonData = [
      ['Header1', 'Header2'],
      ['Value1', testDate],
    ];

    mockXLSX.read.mockReturnValue(mockWorkbook);
    mockXLSX.utils.sheet_to_json.mockReturnValue(mockJsonData);

    const result = await ProcessSpeedgoXlsx(mockFile);

    expect(result).toEqual([
      { A: 'Header1', B: 'Header2' },
      { A: 'Value1', B: '2023-12-25' },
    ]);
  });

  /**
   * Tests handling of null and undefined values.
   */
  it('should handle null and undefined values as empty strings', async () => {
    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    };

    const mockJsonData = [
      ['Header1', 'Header2', 'Header3'],
      ['Value1', null, undefined],
    ];

    mockXLSX.read.mockReturnValue(mockWorkbook);
    mockXLSX.utils.sheet_to_json.mockReturnValue(mockJsonData);

    const result = await ProcessSpeedgoXlsx(mockFile);

    expect(result).toEqual([
      { A: 'Header1', B: 'Header2', C: 'Header3' },
      { A: 'Value1', B: '', C: '' },
    ]);
  });

  /**
   * Tests column letter generation for many columns.
   */
  it('should handle many columns and generate correct column letters', async () => {
    const mockFile = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    };

    // Create row with 28 columns (A-Z, AA, AB)
    const mockJsonData = [
      Array.from({ length: 28 }, (_, i) => `Col${i + 1}`),
    ];

    mockXLSX.read.mockReturnValue(mockWorkbook);
    mockXLSX.utils.sheet_to_json.mockReturnValue(mockJsonData);

    const result = await ProcessSpeedgoXlsx(mockFile);

    expect(result[0]).toHaveProperty('A');
    expect(result[0]).toHaveProperty('Z');
    expect(result[0]).toHaveProperty('AA');
    expect(result[0]).toHaveProperty('AB');
    expect(result[0].AA).toBe('Col27');
    expect(result[0].AB).toBe('Col28');
  });
});