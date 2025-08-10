'use client'
import {useState, useTransition} from "react";
import {
  FileListItem,
  PreviewTable,
  CategoryResultsTable,
  ProcessSpeedgoXlsx,
  submitProductCategorization,
  transformExcelDataToCategorizationRequest
} from "@features/SpeedgoOptimizer";
import {useDropzone} from "react-dropzone";
import {CloudArrowUpIcon} from "@heroicons/react/16/solid";
import {Button} from "@components/ui/button";
import {Text} from "@components/ui/text";
import {useIntlayer} from "next-intlayer";
import {RowData} from "@tanstack/table-core";
import {CategoryResponseItem} from "@features/SpeedgoOptimizer/domain/schemas/CategoryResponse";
import clientLogger from "@/lib/logger.client";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFileIndex, setPreviewFileIndex] = useState<number>(-1);
  const [previewRows, setPreviewRows] = useState<RowData[]>([]);
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [categorizationResults, setCategorizationResults] = useState<CategoryResponseItem[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const content = useIntlayer<'home'>("home")

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
      setProcessingResult(`Maximum 3 files allowed. Only ${filesToAdd.length} files were added.`);
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
      setProcessingResult("Please upload files to process.");
      return;
    }

    startTransition(async () => {
      try {
        setProcessingResult("Processing files...");

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
          setProcessingResult("No valid records found in the uploaded files.");
          return;
        }

        if (totalRecordCount >= maxRecords) {
          setProcessingResult(`Processing ${totalRecordCount} records (maximum limit reached)...`);
        } else {
          setProcessingResult(`Processing ${totalRecordCount} records from ${files.length} file(s)...`);
        }

        // Transform the data for the categorization API
        const categorizationRequest = transformExcelDataToCategorizationRequest(allProcessedData);
        clientLogger.debug('Transformed data for categorization API', 'categorization', {
          requestCount: categorizationRequest.length
        });

        // Submit to categorization API
        const result = await submitProductCategorization(categorizationRequest);

        if (result.success) {
          setProcessingResult(`Successfully processed ${result.data.length} products. Categories received!`);
          setCategorizationResults(result.data);
          clientLogger.info('Categorization completed successfully', 'ui', {
            processedProducts: result.data.length
          });
        } else {
          setProcessingResult(`Processing failed: ${result.error}`);
          setCategorizationResults(null);
          clientLogger.warn('Categorization processing failed', 'ui', {
            error: result.error
          });
        }

      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error processing files');
        clientLogger.error('Error processing files in UI', errorObj, 'ui');
        setProcessingResult(`Error processing files: ${errorObj.message}`);
        setCategorizationResults(null);
      }
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className='h-60 relative block w-full rounded-lg border-2 border-solid border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden'>
          {files.length > 0 ?
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-2">
                Files ready for processing ({files.length}/3 max, ~3000 records limit):
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
                  + Add more files ({3 - files.length} remaining)
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
          <Text className='text-xl'>Process all uploaded files automatically</Text>
          <Text className='text-sm text-gray-600 text-center'>
            All files will be processed together (up to 3000 total records)
          </Text>
          <div>
            <Button
              onClick={handleProcessFiles}
              disabled={isPending || files.length === 0}
            >
              {isPending ? 'Processing...' : `Process ${files.length} file(s)`}
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
        <div className='px-4 py-8 sm:px-6 lg:px-8'>
          <Text>Preview: {files[previewFileIndex]?.name} (first 100 rows)</Text>
          <div
            className="overflow-auto whitespace-nowrap w-full h-60 relative rounded-lg border-2 border-solid border-gray-300 p-4 text-left hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
            <PreviewTable rows={previewRows}/>
          </div>
        </div>
      )}

      {/* Display categorization results when available */}
      {categorizationResults && categorizationResults.length > 0 && (
        <div className='px-4 py-8 sm:px-6 lg:px-8'>
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
