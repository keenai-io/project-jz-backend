/**
 * @fileoverview Tests for useFileManagement hook
 * @module features/SpeedgoOptimizer/__tests__/hooks/useFileManagement.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileManagement } from '../../hooks/useFileManagement';

// Mock dependencies
vi.mock('@features/SpeedgoOptimizer', () => ({
  ProcessSpeedgoXlsx: vi.fn()
}));

vi.mock('@/lib/logger.client', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn()
  }
}));

/**
 * Test suite for useFileManagement hook.
 * 
 * Tests file upload management, preview functionality, file deletion, and state management.
 * Mocks external dependencies to ensure isolated unit tests.
 */
describe('useFileManagement', () => {
  const mockFiles = [
    new File(['content1'], 'file1.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    new File(['content2'], 'file2.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    new File(['content3'], 'file3.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    new File(['content4'], 'file4.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  ];

  const mockRowData = [
    { A: 'Header1', B: 'Header2' },
    { A: 'Value1', B: 'Value2' },
    { A: 'Value3', B: 'Value4' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    /**
     * Tests initial hook state.
     */
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useFileManagement());

      expect(result.current.files).toEqual([]);
      expect(result.current.previewFileIndex).toBe(-1);
      expect(result.current.previewRows).toEqual([]);
    });
  });

  describe('onDrop', () => {
    /**
     * Tests successful file drop handling.
     */
    it('should add files when dropped', () => {
      const { result } = renderHook(() => useFileManagement());

      act(() => {
        result.current.onDrop([mockFiles[0], mockFiles[1]]);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0]).toBe(mockFiles[0]);
      expect(result.current.files[1]).toBe(mockFiles[1]);
    });

    /**
     * Tests file limit enforcement (max 3 files).
     */
    it('should enforce file limit of 3 files', async () => {
      const clientLogger = vi.mocked(await import('@/lib/logger.client')).default;
      const { result } = renderHook(() => useFileManagement());

      // Add 2 files first
      act(() => {
        result.current.onDrop([mockFiles[0], mockFiles[1]]);
      });

      // Try to add 2 more files (should only add 1)
      act(() => {
        result.current.onDrop([mockFiles[2], mockFiles[3]]);
      });

      expect(result.current.files).toHaveLength(3);
      expect(clientLogger.warn).toHaveBeenCalledWith(
        'File limit exceeded',
        'ui',
        {
          attempted: 2,
          accepted: 1,
          maxFiles: 3
        }
      );
    });

    /**
     * Tests that preview is cleared when adding new files.
     */
    it('should clear preview when adding new files', async () => {
      const { ProcessSpeedgoXlsx } = vi.mocked(await import('@features/SpeedgoOptimizer'));
      ProcessSpeedgoXlsx.mockResolvedValue(mockRowData);

      const { result } = renderHook(() => useFileManagement());

      // Add a file and set preview
      act(() => {
        result.current.onDrop([mockFiles[0]]);
      });

      await act(async () => {
        await result.current.onPreviewFile(0);
      });

      expect(result.current.previewFileIndex).toBe(0);
      expect(result.current.previewRows).toEqual(mockRowData);

      // Add another file
      act(() => {
        result.current.onDrop([mockFiles[1]]);
      });

      expect(result.current.previewFileIndex).toBe(-1);
      expect(result.current.previewRows).toEqual([]);
    });

    /**
     * Tests adding files to existing collection.
     */
    it('should append files to existing collection', () => {
      const { result } = renderHook(() => useFileManagement());

      // Add first file
      act(() => {
        result.current.onDrop([mockFiles[0]]);
      });

      // Add second file
      act(() => {
        result.current.onDrop([mockFiles[1]]);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0]).toBe(mockFiles[0]);
      expect(result.current.files[1]).toBe(mockFiles[1]);
    });
  });

  describe('onDeleteFile', () => {
    /**
     * Tests successful file deletion.
     */
    it('should delete file at specified index', () => {
      const { result } = renderHook(() => useFileManagement());

      // Add files first
      act(() => {
        result.current.onDrop([mockFiles[0], mockFiles[1], mockFiles[2]]);
      });

      // Delete middle file
      act(() => {
        result.current.onDeleteFile(1);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0]).toBe(mockFiles[0]);
      expect(result.current.files[1]).toBe(mockFiles[2]);
    });

    /**
     * Tests that preview is cleared when deleting files.
     */
    it('should clear preview when deleting files', async () => {
      const { ProcessSpeedgoXlsx } = vi.mocked(await import('@features/SpeedgoOptimizer'));
      ProcessSpeedgoXlsx.mockResolvedValue(mockRowData);

      const { result } = renderHook(() => useFileManagement());

      // Add files and set preview
      act(() => {
        result.current.onDrop([mockFiles[0], mockFiles[1]]);
      });

      await act(async () => {
        await result.current.onPreviewFile(1);
      });

      expect(result.current.previewFileIndex).toBe(1);
      expect(result.current.previewRows).toEqual(mockRowData);

      // Delete a file
      act(() => {
        result.current.onDeleteFile(0);
      });

      expect(result.current.previewFileIndex).toBe(-1);
      expect(result.current.previewRows).toEqual([]);
    });

    /**
     * Tests deleting file at invalid index.
     */
    it('should handle deletion at invalid index gracefully', () => {
      const { result } = renderHook(() => useFileManagement());

      // Add one file
      act(() => {
        result.current.onDrop([mockFiles[0]]);
      });

      // Try to delete at invalid index
      act(() => {
        result.current.onDeleteFile(5);
      });

      // Should still have the original file
      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toBe(mockFiles[0]);
    });
  });

  describe('onPreviewFile', () => {
    /**
     * Tests successful file preview.
     */
    it('should preview file successfully', async () => {
      const { ProcessSpeedgoXlsx } = vi.mocked(await import('@features/SpeedgoOptimizer'));
      ProcessSpeedgoXlsx.mockResolvedValue(mockRowData);

      const { result } = renderHook(() => useFileManagement());

      // Add files
      act(() => {
        result.current.onDrop([mockFiles[0], mockFiles[1]]);
      });

      // Preview first file
      await act(async () => {
        await result.current.onPreviewFile(0);
      });

      expect(result.current.previewFileIndex).toBe(0);
      expect(result.current.previewRows).toEqual(mockRowData);
      expect(ProcessSpeedgoXlsx).toHaveBeenCalledWith(mockFiles[0]);
    });

    /**
     * Tests preview with large dataset (pagination).
     */
    it('should limit preview to first 100 rows', async () => {
      const { ProcessSpeedgoXlsx } = vi.mocked(await import('@features/SpeedgoOptimizer'));
      
      // Create 150 rows of mock data
      const largeDataset = Array.from({ length: 150 }, (_, i) => ({
        A: `Value${i}A`,
        B: `Value${i}B`
      }));
      
      ProcessSpeedgoXlsx.mockResolvedValue(largeDataset);

      const { result } = renderHook(() => useFileManagement());

      // Add file
      act(() => {
        result.current.onDrop([mockFiles[0]]);
      });

      // Preview file
      await act(async () => {
        await result.current.onPreviewFile(0);
      });

      expect(result.current.previewRows).toHaveLength(100);
      expect(result.current.previewRows[0]).toEqual({ A: 'Value0A', B: 'Value0B' });
      expect(result.current.previewRows[99]).toEqual({ A: 'Value99A', B: 'Value99B' });
    });

    /**
     * Tests preview error handling.
     */
    it('should handle preview errors gracefully', async () => {
      const { ProcessSpeedgoXlsx } = vi.mocked(await import('@features/SpeedgoOptimizer'));
      const clientLogger = vi.mocked(await import('@/lib/logger.client')).default;
      
      const previewError = new Error('File processing failed');
      ProcessSpeedgoXlsx.mockRejectedValue(previewError);

      const { result } = renderHook(() => useFileManagement());

      // Add file
      act(() => {
        result.current.onDrop([mockFiles[0]]);
      });

      // Try to preview file
      await act(async () => {
        await result.current.onPreviewFile(0);
      });

      expect(result.current.previewFileIndex).toBe(0);
      expect(result.current.previewRows).toEqual([]);
      expect(clientLogger.error).toHaveBeenCalledWith(
        'Failed to preview file',
        previewError,
        'file',
        { fileName: mockFiles[0].name }
      );
    });

    /**
     * Tests preview with invalid file index.
     */
    it('should handle invalid file index', async () => {
      const { ProcessSpeedgoXlsx } = vi.mocked(await import('@features/SpeedgoOptimizer'));
      
      const { result } = renderHook(() => useFileManagement());

      // Add one file
      act(() => {
        result.current.onDrop([mockFiles[0]]);
      });

      // Try to preview non-existent file
      await act(async () => {
        await result.current.onPreviewFile(5);
      });

      expect(ProcessSpeedgoXlsx).toHaveBeenCalledWith(undefined);
      expect(result.current.previewFileIndex).toBe(5);
    });

    /**
     * Tests sequential preview operations.
     */
    it('should handle sequential preview operations', async () => {
      const { ProcessSpeedgoXlsx } = vi.mocked(await import('@features/SpeedgoOptimizer'));
      ProcessSpeedgoXlsx.mockResolvedValue(mockRowData);

      const { result } = renderHook(() => useFileManagement());

      // Add files
      act(() => {
        result.current.onDrop([mockFiles[0], mockFiles[1]]);
      });

      // Preview first file
      await act(async () => {
        await result.current.onPreviewFile(0);
      });

      expect(result.current.previewFileIndex).toBe(0);

      // Preview second file
      await act(async () => {
        await result.current.onPreviewFile(1);
      });

      expect(result.current.previewFileIndex).toBe(1);
      expect(result.current.previewRows).toEqual(mockRowData);
    });
  });

  describe('state consistency', () => {
    /**
     * Tests that all operations maintain consistent state.
     */
    it('should maintain consistent state across operations', async () => {
      const { ProcessSpeedgoXlsx } = vi.mocked(await import('@features/SpeedgoOptimizer'));
      ProcessSpeedgoXlsx.mockResolvedValue(mockRowData);

      const { result } = renderHook(() => useFileManagement());

      // Add files
      act(() => {
        result.current.onDrop([mockFiles[0], mockFiles[1]]);
      });

      // Preview first file
      await act(async () => {
        await result.current.onPreviewFile(0);
      });

      // Delete second file
      act(() => {
        result.current.onDeleteFile(1);
      });

      // State should be consistent
      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toBe(mockFiles[0]);
      expect(result.current.previewFileIndex).toBe(-1);
      expect(result.current.previewRows).toEqual([]);
    });
  });
});