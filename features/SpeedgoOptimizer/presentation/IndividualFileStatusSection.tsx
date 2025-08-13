'use client'

import React, { ReactElement } from 'react';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { Heading } from '@components/ui/heading';
import { Badge } from '@components/ui/badge';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/16/solid';
import { FileProcessingResult } from '@features/SpeedgoOptimizer/hooks/useFileProcessing';
import { exportCategorizationResultsToExcel } from '@features/SpeedgoOptimizer/application/exportCategorizationResults';
import { CategoryResponseItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';
import clientLogger from '@/lib/logger.client';
import { useIntlayer } from 'next-intlayer';

interface IndividualFileStatusSectionProps {
  /** Array of individual file processing results */
  individualResults: FileProcessingResult[];
  /** Callback when a file result is clicked to view its categorization results */
  onFileResultClick?: (fileName: string, results: CategoryResponseItem[]) => void;
}

/**
 * Individual File Status Section Component
 * 
 * Displays the processing status for each individual file and allows
 * individual export of results.
 */
export function IndividualFileStatusSection({
  individualResults,
  onFileResultClick
}: IndividualFileStatusSectionProps): ReactElement {
  const content = useIntlayer<'individual-file-status-section'>('individual-file-status-section');

  if (individualResults.length === 0) {
    return <></>;
  }

  const handleExportFile = async (fileResult: FileProcessingResult): Promise<void> => {
    if (!fileResult.results || fileResult.results.length === 0) {
      clientLogger.warn('No results to export for file', 'ui', {
        fileName: fileResult.file.name
      });
      return;
    }

    try {
      const fileName = `${fileResult.file.name.replace('.xlsx', '')}_categorized`;
      await exportCategorizationResultsToExcel(fileResult.results, { filename: fileName });
      
      clientLogger.info('Individual file exported successfully', 'ui', {
        fileName: fileResult.file.name,
        exportedFileName: `${fileName}.xlsx`,
        resultCount: fileResult.results.length
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown export error');
      clientLogger.error('Failed to export individual file', errorObj, 'ui', {
        fileName: fileResult.file.name
      });
    }
  };

  const getStatusIcon = (status: FileProcessingResult['status']): ReactElement => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: FileProcessingResult['status']): ReactElement => {
    switch (status) {
      case 'completed':
        return <Badge color="green">{content.statusLabels.completed.value}</Badge>;
      case 'error':
        return <Badge color="red">{content.statusLabels.error.value}</Badge>;
      case 'processing':
        return <Badge color="blue">{content.statusLabels.processing.value}</Badge>;
      case 'pending':
        return <Badge color="zinc">{content.statusLabels.pending.value}</Badge>;
      default:
        return <Badge color="zinc">{content.statusLabels.unknown.value}</Badge>;
    }
  };

  const completedFiles = individualResults.filter(result => result.status === 'completed');
  const errorFiles = individualResults.filter(result => result.status === 'error');
  const totalResults = completedFiles.reduce((sum, file) => sum + (file.results?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="mb-6">
          <Heading level={2} className="text-2xl font-bold text-gray-900 mb-2">
            {content.title.value}
          </Heading>
          <Text className="text-gray-600">
            {content.description.value}
          </Text>
          
          {/* Summary Statistics */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <Text className="text-sm font-medium">
                {content.summaryStats.completed.value.replace('{count}', completedFiles.length.toString())}
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <Text className="text-sm font-medium">
                {content.summaryStats.failed.value.replace('{count}', errorFiles.length.toString())}
              </Text>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-5 h-5 text-blue-600" />
              <Text className="text-sm font-medium">
                {content.summaryStats.totalProducts.value.replace('{count}', totalResults.toString())}
              </Text>
            </div>
          </div>
        </div>

        {/* File Status List */}
        <div className="space-y-4">
          {individualResults.map((fileResult) => {
            const isClickable = fileResult.status === 'completed' && fileResult.results && fileResult.results.length > 0;
            
            return (
              <div
                key={fileResult.id}
                className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg ${
                  isClickable 
                    ? 'bg-white hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors duration-200' 
                    : 'bg-gray-50'
                }`}
                onClick={isClickable && onFileResultClick 
                  ? () => onFileResultClick(fileResult.file.name, fileResult.results!)
                  : undefined
                }
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {getStatusIcon(fileResult.status)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <Text className={`font-medium truncate ${
                        isClickable ? 'text-blue-900 hover:text-blue-700' : 'text-gray-900'
                      }`}>
                        {fileResult.file.name}
                      </Text>
                      {getStatusBadge(fileResult.status)}
                      {isClickable && (
                        <Text className="text-xs text-blue-600 font-medium">
                          {content.clickToView.value}
                        </Text>
                      )}
                    </div>
                    
                    {fileResult.status === 'completed' && fileResult.recordCount && fileResult.results && (
                      <Text className="text-sm text-gray-600">
                        {content.recordsToProducts.value
                          .replace('{recordCount}', fileResult.recordCount.toString())
                          .replace('{productCount}', fileResult.results.length.toString())}
                      </Text>
                    )}
                    
                    {fileResult.status === 'error' && fileResult.error && (
                      <Text className="text-sm text-red-600">
                        {fileResult.error}
                      </Text>
                    )}
                    
                    {fileResult.status === 'processing' && (
                      <Text className="text-sm text-blue-600">
                        {content.processingStatus.value}
                      </Text>
                    )}
                  </div>
                </div>

                {/* Export Button */}
                {fileResult.status === 'completed' && fileResult.results && fileResult.results.length > 0 && (
                  <Button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation(); // Prevent triggering the row click
                      handleExportFile(fileResult);
                    }}
                    color="blue"
                    className="ml-4 flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>{content.exportButton.value}</span>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}