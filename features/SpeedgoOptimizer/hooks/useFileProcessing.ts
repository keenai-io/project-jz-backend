'use client'

import { useState, useCallback } from 'react';
import { 
  ProcessSpeedgoXlsx, 
  transformExcelDataToCategorizationRequest,
  useProductCategorization 
} from '@features/SpeedgoOptimizer';
import { CategoryResponseItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';
import { RowData } from '@tanstack/table-core';
import { useIntlayer, useLocale } from 'next-intlayer';
import { Locales } from 'intlayer';
import clientLogger from '@/lib/logger.client';

/**
 * Custom hook for handling file processing and categorization
 */
export function useFileProcessing() {
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [categorizationResults, setCategorizationResults] = useState<CategoryResponseItem[] | null>(null);
  const { locale } = useLocale();
  const content = useIntlayer('home');
  const categorizationMutation = useProductCategorization();

  const handleProcessFiles = useCallback(async (files: File[]): Promise<void> => {
    if (files.length === 0) {
      setProcessingResult(content.ProcessSection.noFilesToProcess.value);
      return;
    }

    try {
      setProcessingResult(content.ProcessSection.processingFiles.value);

      // Process all files and collect their data with 3000 record limit
      const allProcessedData: RowData[] = [];
      let totalRecordCount = 0;
      const maxRecords = 3000;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue; // Skip if file is undefined

        const processedData = await ProcessSpeedgoXlsx(file);

        // Calculate how many records we can still add
        const remainingCapacity = maxRecords - totalRecordCount;
        if (remainingCapacity <= 0) {
          clientLogger.warn('Record limit reached, skipping remaining files', 'categorization', {
            skippedFiles: files.length - i,
            totalRecords: totalRecordCount,
            maxRecords
          });
          break;
        }

        // Take only what fits within the limit
        const dataToAdd = processedData.slice(0, remainingCapacity);
        allProcessedData.push(...dataToAdd);
        totalRecordCount += dataToAdd.length;

        clientLogger.info(`Processed file ${i + 1}/${files.length}`, 'categorization', {
          fileName: file.name,
          recordsInFile: processedData.length,
          recordsAdded: dataToAdd.length,
          totalRecords: totalRecordCount
        });

        if (dataToAdd.length < processedData.length) {
          clientLogger.warn('File partially processed due to record limit', 'categorization', {
            fileName: file.name,
            totalRecordsInFile: processedData.length,
            recordsProcessed: dataToAdd.length,
            recordsSkipped: processedData.length - dataToAdd.length
          });
        }
      }

      if (allProcessedData.length === 0) {
        setProcessingResult(content.ProcessSection.noValidRecords.value);
        return;
      }

      if (totalRecordCount >= maxRecords) {
        setProcessingResult(
          content.ProcessSection.processingRecordsLimit.value
            .replace('{count}', totalRecordCount.toString())
        );
      } else {
        setProcessingResult(
          content.ProcessSection.processingRecords.value
            .replace('{count}', totalRecordCount.toString())
            .replace('{fileCount}', files.length.toString())
        );
      }

      // Transform the data for the categorization API
      const categorizationRequest = transformExcelDataToCategorizationRequest(
        allProcessedData, 
        locale as Locales
      );
      
      clientLogger.debug('Transformed data for categorization API', 'categorization', {
        requestCount: categorizationRequest.length
      });

      // Submit to categorization API using TanStack Query mutation
      const result = await categorizationMutation.mutateAsync(categorizationRequest);

      if (result.success) {
        setProcessingResult(
          content.ProcessSection.successProcessed.value
            .replace('{count}', result.data.length.toString())
        );
        setCategorizationResults(result.data);
        clientLogger.info('Categorization completed successfully', 'ui', {
          processedProducts: result.data.length
        });
      } else {
        setProcessingResult(
          content.ProcessSection.processingFailed.value
            .replace('{error}', result.error || '')
        );
        setCategorizationResults(null);
        clientLogger.warn('Categorization processing failed', 'ui', {
          error: result.error
        });
      }

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error processing files');
      clientLogger.error('Error processing files in UI', errorObj, 'ui');
      setProcessingResult(
        content.ProcessSection.errorProcessing.value
          .replace('{error}', errorObj.message)
      );
      setCategorizationResults(null);
    }
  }, [content, locale, categorizationMutation]);

  return {
    processingResult,
    categorizationResults,
    isProcessing: categorizationMutation.isPending,
    handleProcessFiles
  };
}