'use client'

import { useState, useCallback } from 'react';
import ProcessSpeedgoXlsx from '@features/SpeedgoOptimizer/application/ProcessSpeedgoXlsx';
import { transformExcelDataToCategorizationRequest } from '@features/SpeedgoOptimizer/application/transformExcelData';
import { useProductCategorization } from '@features/SpeedgoOptimizer/hooks/useProductCategorization';
import { CategoryResponseItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';
import { useIntlayer, useLocale } from 'next-intlayer';
import { Locales } from 'intlayer';
import clientLogger from '@/lib/logger.client';

export interface FileProcessingResult {
  /** Original file object */
  file: File;
  /** Processing status */
  status: 'pending' | 'processing' | 'completed' | 'error';
  /** Number of records processed from this file */
  recordCount?: number;
  /** Categorization results for this specific file */
  results?: CategoryResponseItem[];
  /** Error message if processing failed */
  error?: string;
  /** Unique identifier for this file processing task */
  id: string;
}

/**
 * Custom hook for handling individual file processing and categorization
 */
export function useFileProcessing() {
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [categorizationResults, setCategorizationResults] = useState<CategoryResponseItem[] | null>(null);
  const [individualResults, setIndividualResults] = useState<FileProcessingResult[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Locales | null>(null);
  const { locale } = useLocale();
  const content = useIntlayer<'use-file-processing'>('use-file-processing');
  const categorizationMutation = useProductCategorization();

  const handleProcessFiles = useCallback(async (files: File[]): Promise<void> => {
    if (files.length === 0) {
      setProcessingResult(content.noFilesToProcess.value);
      return;
    }

    try {
      setProcessingResult(content.processingFiles.value);

      // Initialize individual results for each file
      const initialResults: FileProcessingResult[] = files.map((file, index) => ({
        file,
        status: 'pending',
        id: `${file.name}-${Date.now()}-${index}`
      }));
      setIndividualResults(initialResults);

      // Process files individually with 3000 total record limit across all files
      const allResults: CategoryResponseItem[] = [];
      let totalRecordCount = 0;
      const maxRecords = 3000;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = initialResults[i]?.id;
        if (!fileId) continue;
        
        if (!file) continue;

        // Check if we've reached the total limit
        if (totalRecordCount >= maxRecords) {
          setIndividualResults(prev => prev.map(result => 
            result.id === fileId 
              ? { 
                  ...result, 
                  status: 'error',
                  error: content.skippedTotalLimit.value.replace('{maxRecords}', maxRecords.toString())
                }
              : result
          ));
          
          clientLogger.warn('Total record limit reached, skipping remaining files', 'categorization', {
            fileName: file.name,
            skippedFiles: files.length - i,
            totalRecords: totalRecordCount,
            maxRecords
          });
          continue;
        }

        try {
          // Update status to processing
          setIndividualResults(prev => prev.map(result => 
            result.id === fileId 
              ? { ...result, status: 'processing' }
              : result
          ));

          const processedData = await ProcessSpeedgoXlsx(file);

          if (processedData.length === 0) {
            setIndividualResults(prev => prev.map(result => 
              result.id === fileId 
                ? { 
                    ...result, 
                    status: 'error',
                    error: 'No valid records found in file'
                  }
                : result
            ));
            continue;
          }

          // Calculate how many records we can still add
          const remainingCapacity = maxRecords - totalRecordCount;
          const dataToAdd = processedData.slice(0, remainingCapacity);
          
          // Transform the data for the categorization API
          // Use selected language or fallback to current locale
          const languageToUse = selectedLanguage || (locale as Locales);
          const categorizationRequest = transformExcelDataToCategorizationRequest(
            dataToAdd, 
            languageToUse
          );

          // Submit to categorization API for this individual file
          const result = await categorizationMutation.mutateAsync(categorizationRequest);

          if (result.success) {
            setIndividualResults(prev => prev.map(item => 
              item.id === fileId 
                ? { 
                    ...item, 
                    status: 'completed',
                    recordCount: dataToAdd.length,
                    results: result.data
                  }
                : item
            ));

            allResults.push(...result.data);
            totalRecordCount += dataToAdd.length;

            clientLogger.info(`File ${i + 1}/${files.length} processed successfully`, 'categorization', {
              fileName: file.name,
              recordsInFile: processedData.length,
              recordsAdded: dataToAdd.length,
              totalRecords: totalRecordCount,
              categorizedProducts: result.data.length
            });

            if (dataToAdd.length < processedData.length) {
              clientLogger.warn('File partially processed due to record limit', 'categorization', {
                fileName: file.name,
                totalRecordsInFile: processedData.length,
                recordsProcessed: dataToAdd.length,
                recordsSkipped: processedData.length - dataToAdd.length
              });
            }
          } else {
            setIndividualResults(prev => prev.map(item => 
              item.id === fileId 
                ? { 
                    ...item, 
                    status: 'error',
                    error: result.error
                  }
                : item
            ));

            clientLogger.warn(`File ${i + 1} processing failed`, 'categorization', {
              fileName: file.name,
              error: result.error
            });
          }

          // Add small delay between files to prevent overwhelming the API
          if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Unknown error processing file');
          
          setIndividualResults(prev => prev.map(item => 
            item.id === fileId 
              ? { 
                  ...item, 
                  status: 'error',
                  error: errorObj.message
                }
              : item
          ));

          clientLogger.error(`Error processing file ${i + 1}`, errorObj, 'categorization', {
            fileName: file.name
          });
        }
      }

      // Set final results and summary
      const completedFiles = initialResults.filter((_, index) => {
        const current = individualResults.find(r => r.id === initialResults[index]?.id);
        return current?.status === 'completed';
      }).length;

      const errorFiles = initialResults.filter((_, index) => {
        const current = individualResults.find(r => r.id === initialResults[index]?.id);
        return current?.status === 'error';
      }).length;

      if (allResults.length === 0) {
        setProcessingResult(content.noFilesProcessed.value);
        setCategorizationResults(null);
        return;
      }

      if (totalRecordCount >= maxRecords) {
        setProcessingResult(
          content.processingCompletedWithLimit.value
            .replace('{completedFiles}', completedFiles.toString())
            .replace('{errorFiles}', errorFiles.toString())
            .replace('{totalProducts}', allResults.length.toString())
            .replace('{totalRecords}', totalRecordCount.toString())
            .replace('{maxRecords}', maxRecords.toString())
        );
      } else {
        setProcessingResult(
          content.processingCompleted.value
            .replace('{completedFiles}', completedFiles.toString())
            .replace('{errorFiles}', errorFiles.toString())
            .replace('{totalProducts}', allResults.length.toString())
            .replace('{totalRecords}', totalRecordCount.toString())
        );
      }
      
      setCategorizationResults(allResults);
      clientLogger.info('All files processing completed', 'ui', {
        totalFiles: files.length,
        completedFiles,
        errorFiles,
        totalProducts: allResults.length,
        totalRecords: totalRecordCount
      });

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error processing files');
      clientLogger.error('Error processing files in UI', errorObj, 'ui');
      setProcessingResult(
        content.errorProcessing.value
          .replace('{error}', errorObj.message)
      );
      setCategorizationResults(null);
    }
  }, [content, locale, categorizationMutation]);

  return {
    processingResult,
    categorizationResults,
    individualResults,
    isProcessing: categorizationMutation.isPending,
    selectedLanguage,
    setSelectedLanguage,
    handleProcessFiles
  };
}