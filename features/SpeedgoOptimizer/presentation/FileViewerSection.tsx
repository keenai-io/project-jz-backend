'use client'

import { ReactElement } from 'react';
import { PreviewTable } from '@features/SpeedgoOptimizer';
import { useIntlayer } from 'next-intlayer';
import { RowData } from '@tanstack/table-core';

interface FileViewerSectionProps {
  /** Index of currently previewed file (-1 if none) */
  previewFileIndex: number;
  /** Array of uploaded files */
  files: File[];
  /** Preview data rows to display */
  previewRows: RowData[];
}

/**
 * File Viewer Section Component
 * 
 * Displays the file preview area with table data.
 * Shows empty state when no file is selected for preview.
 */
export function FileViewerSection({
  previewFileIndex,
  files,
  previewRows
}: FileViewerSectionProps): ReactElement {
  const content = useIntlayer('home');

  const hasValidPreview = previewFileIndex !== -1 && 
    previewFileIndex < files.length && 
    files[previewFileIndex] && 
    previewRows && 
    previewRows.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        {content.FilePreview.title}
      </h2>
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-200 shadow-sm">
        {hasValidPreview ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {content.ProcessSection.previewTitle.value
                .replace('{fileName}', files[previewFileIndex]?.name || '')}
            </h3>
            <div className="overflow-auto max-h-80 border border-gray-200 rounded-xl">
              <PreviewTable rows={previewRows} />
            </div>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="text-gray-400 text-lg">
              {content.FilePreview.emptyMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}