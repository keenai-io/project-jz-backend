'use client'

import { ReactElement } from 'react';
import {
  FileUploadArea,
  UploadedFilesList,
  FileProcessingSection,
  FileViewerSection,
  CategorizationResultsSection,
  useFileManagement,
  useFileProcessing
} from '@features/SpeedgoOptimizer';

/**
 * Home Page Component
 * 
 * Main page for file upload, processing, and viewing categorization results.
 * Provides a clean interface for Speedgo Excel file optimization workflow.
 */
export default function Home(): ReactElement {
  // Custom hooks for file management and processing
  const {
    files,
    previewFileIndex,
    previewRows,
    onDrop,
    onDeleteFile,
    onPreviewFile
  } = useFileManagement();

  const {
    processingResult,
    categorizationResults,
    isProcessing,
    handleProcessFiles
  } = useFileProcessing();

  // Wrapper function to pass files to the processing hook
  const onProcessFiles = () => handleProcessFiles(files);

  return (
    <>
      {/* Main Upload and Process Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          
          {/* Upload Area - Left Side */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-200 p-6 sm:p-8 shadow-sm">
            {files.length > 0 ? (
              <UploadedFilesList
                files={files}
                previewFileIndex={previewFileIndex}
                onPreviewFile={onPreviewFile}
                onDeleteFile={onDeleteFile}
                onAddMoreFiles={onDrop}
              />
            ) : (
              <FileUploadArea onDrop={onDrop} />
            )}
          </div>

          {/* Process Area - Right Side */}
          <FileProcessingSection
            fileCount={files.length}
            isProcessing={isProcessing}
            processingResult={processingResult}
            onProcessFiles={onProcessFiles}
          />
        </div>
      </div>

      {/* File Viewer Section */}
      <FileViewerSection
        previewFileIndex={previewFileIndex}
        files={files}
        previewRows={previewRows}
      />

      {/* Categorization Results Section */}
      {categorizationResults && categorizationResults.length > 0 && (
        <CategorizationResultsSection results={categorizationResults} />
      )}
    </>
  )
}
