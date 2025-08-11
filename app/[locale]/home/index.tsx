'use client'
import {useState} from "react";
import {
  FileListItem,
  PreviewTable,
  CategoryResultsTable,
  ProcessSpeedgoXlsx,
  transformExcelDataToCategorizationRequest,
  useProductCategorization
} from "@features/SpeedgoOptimizer";
import {useDropzone} from "react-dropzone";
import {CloudArrowUpIcon} from "@heroicons/react/16/solid";
import {Button} from "@components/ui/button";
import {Text} from "@components/ui/text";
import {useIntlayer, useLocale} from "next-intlayer";
import {RowData} from "@tanstack/table-core";
import {CategoryResponseItem} from "@features/SpeedgoOptimizer/domain/schemas/CategoryResponse";
import clientLogger from "@/lib/logger.client";
import {Locales} from "intlayer";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFileIndex, setPreviewFileIndex] = useState<number>(-1);
  const [previewRows, setPreviewRows] = useState<RowData[]>([]);
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [categorizationResults, setCategorizationResults] = useState<CategoryResponseItem[] | null>(null);
  const { locale } = useLocale();
  const content = useIntlayer<'home'>("home");
  
  // Use TanStack Query mutation for product categorization
  const categorizationMutation = useProductCategorization();

  const onDrop = (acceptedFiles: File[]) => {
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
      setProcessingResult(content.ProcessSection.maxFilesWarning.value.replace('{accepted}', filesToAdd.length.toString()));
    }

    // Clear preview when adding new files to avoid stale data
    setPreviewRows([]);
    setPreviewFileIndex(-1);

    setFiles(prevFiles => [...prevFiles, ...filesToAdd]);
  };

  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 3,
    onDrop
  });

  const onDeleteFile = (index: number) => {
    // Clear preview data first
    setPreviewRows([]);
    setPreviewFileIndex(-1);

    // Then remove the file
    setFiles(prevFiles =>
      prevFiles.filter((_f, i) => i !== index)
    );
  }

  const onPreviewFile = (index: number) => {
    setPreviewFileIndex(index);
    // Load preview for the selected file
    ProcessSpeedgoXlsx(files[index]!)
      .then(rows => {
        // Show first 100 rows for preview to avoid performance issues
        setPreviewRows([...rows.slice(0, 100)]);
      })
      .catch(error => {
        clientLogger.error('Failed to preview file', error, 'file', {fileName: files[index]?.name});
        setPreviewRows([]);
      });
  }

  const handleProcessFiles = async (): Promise<void> => {
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
        setProcessingResult(content.ProcessSection.processingRecordsLimit.value.replace('{count}', totalRecordCount.toString()));
      } else {
        setProcessingResult(content.ProcessSection.processingRecords.value.replace('{count}', totalRecordCount.toString()).replace('{fileCount}', files.length.toString()));
      }

      // Transform the data for the categorization API
      const categorizationRequest = transformExcelDataToCategorizationRequest(allProcessedData, locale as Locales);
      clientLogger.debug('Transformed data for categorization API', 'categorization', {
        requestCount: categorizationRequest.length
      });

      // Submit to categorization API using TanStack Query mutation
      const result = await categorizationMutation.mutateAsync(categorizationRequest);

      if (result.success) {
        setProcessingResult(content.ProcessSection.successProcessed.value.replace('{count}', result.data.length.toString()));
        setCategorizationResults(result.data);
        clientLogger.info('Categorization completed successfully', 'ui', {
          processedProducts: result.data.length
        });
      } else {
        setProcessingResult(content.ProcessSection.processingFailed.value.replace('{error}', result.error || ''));
        setCategorizationResults(null);
        clientLogger.warn('Categorization processing failed', 'ui', {
          error: result.error
        });
      }

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error processing files');
      clientLogger.error('Error processing files in UI', errorObj, 'ui');
      setProcessingResult(content.ProcessSection.errorProcessing.value.replace('{error}', errorObj.message));
      setCategorizationResults(null);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className='h-60 relative block w-full rounded-lg border-2 border-solid border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden'>
          {files.length > 0 ?
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-2">
                {content.ProcessSection.filesReady.value.replace('{current}', files.length.toString()).replace('{max}', '3')}
              </div>
              {files.map((file, index) => (
                <FileListItem key={index} name={file.name} selected={index === previewFileIndex}
                              onClick={() => onPreviewFile(index)}
                              onDelete={() => onDeleteFile(index)}/>))
              }
              {files.length < 3 && (
                <button
                  {...getRootProps({className: 'dropzone'})}
                  type="button"
                  className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
                >
                  <input {...getInputProps()} />
                  {content.ProcessSection.addMoreFiles.value.replace('{remaining}', (3 - files.length).toString())}
                </button>
              )}
            </div>
            :
            <button
              {...getRootProps({className: 'dropzone'})}
              type="button"
              className="h-36 relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
            >
              <div className='flex flex-col'>
                <div className='flex justify-center align-items-center'>
                  <CloudArrowUpIcon width={64}/>
                </div>
                <div>
                  <input {...getInputProps()} />
                  <p>{content.FilePicker.filePickerMessage}</p>
                </div>
              </div>
            </button>
          }
        </div>

        <div className='flex flex-col justify-center items-center space-y-4'>
          <Text className='text-xl'>{content.ProcessSection.title}</Text>
          <Text className='text-sm text-gray-600 text-center'>
            {content.ProcessSection.description}
          </Text>
          <div>
            <Button
              onClick={handleProcessFiles}
              disabled={categorizationMutation.isPending || files.length === 0}
            >
              {categorizationMutation.isPending ? content.ProcessSection.processingButton : content.ProcessSection.processFileCountButton.value.replace('{count}', files.length.toString())}
            </Button>
          </div>
          {processingResult && (
            <div className={`mt-4 p-3 rounded-lg border ${
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
      </div>
      {previewFileIndex !== -1 && previewFileIndex < files.length && files[previewFileIndex] && previewRows && previewRows.length > 0 && (
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <Text>{content.ProcessSection.previewTitle.value.replace('{fileName}', files[previewFileIndex]?.name || '')}</Text>
          <div
            className="overflow-auto whitespace-nowrap w-full h-60 relative rounded-lg border-2 border-solid border-gray-300 p-4 text-left hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
            <PreviewTable rows={previewRows}/>
          </div>
        </div>
      )}

      {/* Display categorization results when available */}
      {categorizationResults && categorizationResults.length > 0 && (
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <CategoryResultsTable
            results={categorizationResults}
            onProductSelect={(product) => {
              clientLogger.info('Product selected for details', 'ui', {
                productNumber: product.product_number,
                productName: product.product_name
              });
              // Future: Could open a modal or navigate to product details
            }}
          />
        </div>
      )}

    </>
  )
}
