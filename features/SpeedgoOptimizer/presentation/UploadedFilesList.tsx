'use client'

import { ReactElement } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useIntlayer } from 'next-intlayer';

interface UploadedFilesListProps {
  /** Array of uploaded files */
  files: File[];
  /** Index of currently previewed file (-1 if none) */
  previewFileIndex: number;
  /** Callback when a file is clicked for preview */
  onPreviewFile: (index: number) => void;
  /** Callback when a file is deleted */
  onDeleteFile: (index: number) => void;
  /** Callback for adding more files */
  onAddMoreFiles: (acceptedFiles: File[]) => void;
}

/**
 * Uploaded Files List Component
 * 
 * Displays uploaded files with preview and delete functionality.
 * Shows an option to add more files if under the limit.
 */
export function UploadedFilesList({
  files,
  previewFileIndex,
  onPreviewFile,
  onDeleteFile,
  onAddMoreFiles
}: UploadedFilesListProps): ReactElement {
  const content = useIntlayer<'uploaded-files-list'>('uploaded-files-list');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 3,
    onDrop: onAddMoreFiles
  });

  return (
    <div className="space-y-6">
      {/* Header with file count */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CloudArrowUpIcon className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {content.filesReadyTitle}
        </h3>
        <p className="text-sm text-gray-600">
          {content.filesReady.value
            .replace('{current}', files.length.toString())
            .replace('{max}', '3')}
        </p>
      </div>

      {/* File list */}
      <div className="space-y-3">
        {files.map((file, index) => (
          <div
            key={index}
            onClick={() => onPreviewFile(index)}
            className={`
              flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
              ${index === previewFileIndex 
                ? 'border-blue-300 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex-shrink-0 mr-4">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${index === previewFileIndex ? 'bg-blue-100' : 'bg-gray-100'}
              `}>
                <CloudArrowUpIcon className={`
                  w-5 h-5 
                  ${index === previewFileIndex ? 'text-blue-600' : 'text-gray-600'}
                `} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {index === previewFileIndex 
                  ? content.currentlyPreviewing 
                  : content.clickToPreview
                }
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(index);
              }}
              className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add more files button */}
      {files.length < 3 && (
        <div className="border-t border-gray-200 pt-6">
          <button
            {...getRootProps({ className: 'dropzone' })}
            type="button"
            className="w-full py-4 px-6 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center space-x-2">
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>
                {content.addMoreFiles.value
                  .replace('{remaining}', (3 - files.length).toString())}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}