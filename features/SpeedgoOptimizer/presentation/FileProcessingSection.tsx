'use client'

import { ReactElement } from 'react';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { useIntlayer } from 'next-intlayer';
import { Locales } from 'intlayer';
import { FileLanguageSelector } from './FileLanguageSelector';

interface FileProcessingSectionProps {
  /** Number of files ready for processing */
  fileCount: number;
  /** Whether processing is currently in progress */
  isProcessing: boolean;
  /** Processing result message to display */
  processingResult?: string | null;
  /** Currently selected language for file processing */
  selectedLanguage: Locales | null;
  /** Callback when language selection changes */
  onLanguageChange: (language: Locales) => void;
  /** Callback when process button is clicked */
  onProcessFiles: () => Promise<void>;
}

/**
 * File Processing Section Component
 * 
 * Displays the processing controls and status for uploaded files.
 * Shows process button, loading state, and result messages.
 */
export function FileProcessingSection({
  fileCount,
  isProcessing,
  processingResult,
  selectedLanguage,
  onLanguageChange,
  onProcessFiles
}: FileProcessingSectionProps): ReactElement {
  const content = useIntlayer<'file-processing-section'>('file-processing-section');

  return (
    <div className="flex flex-col justify-center items-center text-center space-y-6 p-4">
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
          {content.processMessage.value}
        </h2>
        <Text className="text-gray-600">
          {content.description.value}
        </Text>
      </div>
      
      {/* File Language Selection */}
      <div className="w-full max-w-xs">
        <FileLanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          disabled={isProcessing}
        />
      </div>
      
      <Button
        onClick={onProcessFiles}
        disabled={isProcessing || fileCount === 0}
        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? content.processingButton.value : content.processButton.value}
      </Button>
      
      {processingResult && (
        <div className={`mt-4 p-4 rounded-lg border max-w-md ${
          processingResult.includes('failed') || processingResult.includes('Error')
            ? 'bg-red-50 border-red-200'
            : processingResult.includes('Processing')
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
        }`}>
          <Text className={
            processingResult.includes('failed') || processingResult.includes('Error')
              ? 'text-red-600'
              : processingResult.includes('Processing')
                ? 'text-yellow-800'
                : 'text-green-800'
          }>
            {processingResult}
          </Text>
        </div>
      )}
    </div>
  );
}