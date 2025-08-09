'use client'
import {useEffect, useState, useTransition} from "react";
import {FileListItem, PreviewTable, CategoryResultsTable, ProcessSpeedgoXlsx, submitProductCategorization, transformExcelDataToCategorizationRequest} from "@features/SpeedgoOptimizer";
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
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<RowData[]>([]);
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [categorizationResults, setCategorizationResults] = useState<CategoryResponseItem[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const content = useIntlayer<'home'>("home")

  const onDrop = (acceptedFiles: File[]) => {
    //TODO: throw error when more than 3 files are selected
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  };

  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 3,
    onDrop
  });

  useEffect(() => {
    if (previewFile) {
      ProcessSpeedgoXlsx(previewFile).then(rows => setPreviewRows(rows))
    } else {
      setPreviewRows([])
    }
  }, [previewFile])

  const onDeleteFile = (file: File) => {
    setFiles(files.filter(f => f !== file));
    if (previewFile === file) {
      setPreviewFile(null);
      setPreviewRows([])
    }
  }

  const onPreviewFile = (file: File) => {
    setPreviewFile(file);
    // const rows = await ProcessSpeedgoXlsx(file)
  }

  const handleProcessFiles = async (): Promise<void> => {
    if (files.length === 0 || !previewFile) {
      setProcessingResult("Please select files and preview one to process.");
      return;
    }

    startTransition(async () => {
      try {
        setProcessingResult("Processing files...");
        
        // Process all files and collect their data
        const allProcessedData: RowData[] = [];
        
        for (const file of files) {
          const processedData = await ProcessSpeedgoXlsx(file);
          allProcessedData.push(...processedData);
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
            files.map((file, index) => (
              <FileListItem key={index} name={file.name} selected={file === previewFile}
                            onClick={() => onPreviewFile(file)}
                            onDelete={() => onDeleteFile(file)}/>))
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
          <Text className='text-xl'>{content.FilePicker.processMessage}</Text>
          <div>
            <Button 
              onClick={handleProcessFiles}
              disabled={isPending || files.length === 0}
            >
              {isPending ? 'Processing...' : content.FilePicker.processButtonMessage}
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
      <div className='px-4 py-8 sm:px-6 lg:px-8'>
        <Text>{content.FilePreview.title}</Text>
        <div
          className="overflow-auto whitespace-nowrap w-full h-60 relative rounded-lg border-2 border-solid border-gray-300 p-4 text-left hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
          {previewRows.length > 0 ?
            <PreviewTable rows={previewRows}/>
            : <Text>{content.FilePreview.emptyMessage}</Text>}
        </div>
      </div>

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
