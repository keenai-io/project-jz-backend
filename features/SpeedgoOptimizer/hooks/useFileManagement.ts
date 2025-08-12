'use client'

import { useState, useCallback } from 'react';
import { ProcessSpeedgoXlsx } from '@features/SpeedgoOptimizer';
import { RowData } from '@tanstack/table-core';
import clientLogger from '@/lib/logger.client';
import { useIntlayer } from 'next-intlayer';

/**
 * Custom hook for managing file uploads, preview, and deletion
 */
export function useFileManagement() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFileIndex, setPreviewFileIndex] = useState<number>(-1);
  const [previewRows, setPreviewRows] = useState<RowData[]>([]);
  const content = useIntlayer('home');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Limit to maximum 3 files total
    const currentFileCount = files.length;
    const availableSlots = Math.max(0, 3 - currentFileCount);
    const filesToAdd = acceptedFiles.slice(0, availableSlots);

    if (acceptedFiles.length > filesToAdd.length) {
      clientLogger.warn('File limit exceeded', 'ui', {
        attempted: acceptedFiles.length,
        accepted: filesToAdd.length,
        maxFiles: 3
      });
    }

    // Clear preview when adding new files to avoid stale data
    setPreviewRows([]);
    setPreviewFileIndex(-1);

    setFiles(prevFiles => [...prevFiles, ...filesToAdd]);
  }, [files.length]);

  const onDeleteFile = useCallback((index: number) => {
    // Clear preview data first
    setPreviewRows([]);
    setPreviewFileIndex(-1);

    // Then remove the file
    setFiles(prevFiles => prevFiles.filter((_f, i) => i !== index));
  }, []);

  const onPreviewFile = useCallback((index: number) => {
    setPreviewFileIndex(index);
    // Load preview for the selected file
    ProcessSpeedgoXlsx(files[index]!)
      .then(rows => {
        // Show first 100 rows for preview to avoid performance issues
        setPreviewRows([...rows.slice(0, 100)]);
      })
      .catch(error => {
        clientLogger.error('Failed to preview file', error, 'file', {
          fileName: files[index]?.name
        });
        setPreviewRows([]);
      });
  }, [files]);

  return {
    files,
    previewFileIndex,
    previewRows,
    onDrop,
    onDeleteFile,
    onPreviewFile
  };
}