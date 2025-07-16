'use client'
import {useEffect, useState} from "react";
import {Row} from "read-excel-file";
import {FileListItem, ProcessSpeedgoXlsx} from "@features/SpeedgoOptimizer";
import {useDropzone} from "react-dropzone";
import {CloudArrowUpIcon} from "@heroicons/react/16/solid";
import {Button} from "@components/button";
import {Text} from "@components/text";
import {useIntlayer} from "next-intlayer";
import {DictionaryKeys} from "@intlayer/core";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<Row[]>([]);
  const content = useIntlayer("home" as DictionaryKeys)

  useEffect(() => {
    if (previewFile) {
      ProcessSpeedgoXlsx(previewFile).then(rows => setPreviewRows(rows))
    } else {
      setPreviewRows([])
    }
  }, [previewFile])

  const onDrop = (acceptedFiles: File[]) => {
    //TODO: throw error when more than 3 files are selected
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    // ProcessSpeedgoXlsx(acceptedFiles[0]).then(rows => console.log(rows))
  };
  const onPreviewFile = (file: File) => {
    setPreviewFile(file);
    // const rows = await ProcessSpeedgoXlsx(file)
  }
  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 3,
    onDrop
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className='h-60 relative block w-full rounded-lg border-2 border-solid border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden'>
          {files.length > 0 ?
            files.map((file, index) => (
              <FileListItem key={index} name={file.name} selected={file === previewFile}
                            onClick={() => onPreviewFile(file)}
                            onDelete={() => setFiles(files.filter(f => f !== file))}/>))
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

        <div className='flex flex-col justify-center items-center'>
          <Text className='text-xl'>{content.FilePicker.processMessage}</Text>
          <div><Button>{content.FilePicker.processButtonMessage}</Button></div>
        </div>
      </div>
      <div className='px-4 py-8 sm:px-6 lg:px-8'>
        <Text>{content.FilePreview.title}</Text>
        <div
          className='overflow-x-auto whitespace-nowrap w-full flex justify-center items-center h-60 relative w-full rounded-lg border-2 border-solid border-gray-300 p-12 text-center hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden'>
          {previewRows.length > 0 ?
            <table>
              <thead>
              <tr>
                {/* Optionally render headers if you have them */}
                {previewRows[0]?.map((_, colIndex) => (
                  <th key={colIndex}>{colIndex + 1}</th>
                ))}
              </tr>
              </thead>
              <tbody>
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{String(cell)}</td>
                  ))}
                </tr>
              ))}
              </tbody>
            </table>
            : <Text>{content.FilePreview.emptyMessage}</Text>}
        </div>
      </div>

    </>
  )
}
