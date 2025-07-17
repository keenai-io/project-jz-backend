'use client'
import {useEffect, useState} from "react";
import {FileListItem, PreviewTable, ProcessSpeedgoXlsx} from "@features/SpeedgoOptimizer";
import {useDropzone} from "react-dropzone";
import {CloudArrowUpIcon} from "@heroicons/react/16/solid";
import {Button} from "@components/button";
import {Text} from "@components/text";
import {useIntlayer} from "next-intlayer";
import {RowData} from "@tanstack/table-core";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<RowData[]>([]);
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

        <div className='flex flex-col justify-center items-center'>
          <Text className='text-xl'>{content.FilePicker.processMessage}</Text>
          <div><Button>{content.FilePicker.processButtonMessage}</Button></div>
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

    </>
  )
}
