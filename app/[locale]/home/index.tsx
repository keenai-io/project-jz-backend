'use client'

import { ReactElement, useState } from 'react';
import {
  FileUploadArea,
  UploadedFilesList,
  FileProcessingSection,
  FileViewerSection,
  CategorizationResultsSection,
  IndividualFileStatusSection,
  useFileManagement,
  useFileProcessing
} from '@features/SpeedgoOptimizer';
import { CategoryResponseItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';

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
    individualResults,
    isProcessing,
    handleProcessFiles
  } = useFileProcessing();

  // State for selected file results display
  const [selectedFileResults, setSelectedFileResults] = useState<CategoryResponseItem[] | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // Wrapper function to pass files to the processing hook
  const onProcessFiles = () => handleProcessFiles(files);

  // Handler for clicking on individual file results
  const handleFileResultClick = (fileName: string, results: CategoryResponseItem[]): void => {
    setSelectedFileName(fileName);
    setSelectedFileResults(results);
  };

  // Determine which results to show in the categorization table
  const displayResults = selectedFileResults || categorizationResults;

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

      {/* Individual File Status Section */}
      {individualResults && individualResults.length > 0 && (
        <IndividualFileStatusSection 
          individualResults={individualResults}
          onFileResultClick={handleFileResultClick}
        />
      )}

      {/* Categorization Results Section */}
      {displayResults && displayResults.length > 0 && (
        <CategorizationResultsSection 
          results={displayResults}
          selectedFileName={selectedFileName}
          onClearSelection={() => {
            setSelectedFileResults(null);
            setSelectedFileName(null);
          }}
        />
      )}
    </>
  )
}
