'use client'

import { ReactElement } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/16/solid';
import { Button } from '@components/ui/button';
import { useIntlayer } from 'next-intlayer';

interface FileUploadAreaProps {
  /** Callback when files are dropped or selected */
  onDrop: (acceptedFiles: File[]) => void;
}

/**
 * File Upload Area Component
 * 
 * Provides a drag-and-drop interface for file uploads with visual feedback.
 * Accepts only Excel (.xlsx) files for Speedgo processing.
 */
export function FileUploadArea({ onDrop }: FileUploadAreaProps): ReactElement {
  const content = useIntlayer<'file-upload-area'>('file-upload-area');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 3,
    onDrop
  });

  return (
    <div className="text-center">
      <div 
        {...getRootProps({ className: 'dropzone' })}
        className="border-2 border-dashed border-blue-300 rounded-2xl p-8 sm:p-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CloudArrowUpIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {content.dragDropTitle}
            </h3>
            <p className="text-gray-600">
              {content.filePickerMessage}
            </p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 cursor-pointer">
            {content.uploadButtonText}
          </Button>
          <p className="text-sm text-gray-500">
            {content.fileTypeNote}
          </p>
        </div>
      </div>
    </div>
  );
}