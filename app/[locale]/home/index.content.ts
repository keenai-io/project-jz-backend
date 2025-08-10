import {type Dictionary, t} from "intlayer";

const pageContent = {
  key: "home",
  content: {
    FilePicker: {
      filePickerMessage: t({
        en: "Drag and Drop to Upload, or click to select files",
        ko: "드래그 및 드롭으로 업로드하거나 클릭하여 파일을 선택하세요",
      }),
      processMessage: t({
        en: "Optimize products and prepare for upload into Speedgo Transmitter",
        ko: "제품을 최적화하고 Speedgo Transmitter에 업로드할 준비를 하세요"
      }),
      processButtonMessage: t({
        en: 'Process',
        ko: '처리'
      }),
      pageLink: "src/app/home/index.tsx",
    },
    ProcessSection: {
      title: t({
        en: "Process all uploaded files automatically",
        ko: "업로드된 모든 파일을 자동으로 처리합니다"
      }),
      description: t({
        en: "All files will be processed together (up to 3000 total records)",
        ko: "모든 파일이 함께 처리됩니다 (총 3000개 레코드까지)"
      }),
      processButton: t({
        en: "Process",
        ko: "처리"
      }),
      processingButton: t({
        en: "Processing...",
        ko: "처리 중..."
      }),
      processFileCountButton: t({
        en: "Process {count} file(s)",
        ko: "{count}개 파일 처리"
      }),
      filesReady: t({
        en: "Files ready for processing ({current}/{max} max, ~3000 records limit):",
        ko: "처리할 파일 준비 완료 ({current}/{max} 최대, 약 3000개 레코드 제한):"
      }),
      addMoreFiles: t({
        en: "+ Add more files ({remaining} remaining)",
        ko: "+ 더 많은 파일 추가 ({remaining}개 남음)"
      }),
      previewTitle: t({
        en: "Preview: {fileName} (first 100 rows)",
        ko: "미리보기: {fileName} (처음 100행)"
      }),
      noFilesToProcess: t({
        en: "Please upload files to process.",
        ko: "처리할 파일을 업로드해주세요."
      }),
      processingFiles: t({
        en: "Processing files...",
        ko: "파일 처리 중..."
      }),
      processingRecords: t({
        en: "Processing {count} records from {fileCount} file(s)...",
        ko: "{fileCount}개 파일에서 {count}개 레코드 처리 중..."
      }),
      processingRecordsLimit: t({
        en: "Processing {count} records (maximum limit reached)...",
        ko: "{count}개 레코드 처리 중 (최대 제한에 도달)..."
      }),
      noValidRecords: t({
        en: "No valid records found in the uploaded files.",
        ko: "업로드된 파일에서 유효한 레코드를 찾을 수 없습니다."
      }),
      successProcessed: t({
        en: "Successfully processed {count} products. Categories received!",
        ko: "{count}개 제품을 성공적으로 처리했습니다. 카테고리를 받았습니다!"
      }),
      processingFailed: t({
        en: "Processing failed: {error}",
        ko: "처리 실패: {error}"
      }),
      errorProcessing: t({
        en: "Error processing files: {error}",
        ko: "파일 처리 오류: {error}"
      }),
      maxFilesWarning: t({
        en: "Maximum 3 files allowed. Only {accepted} files were added.",
        ko: "최대 3개 파일만 허용됩니다. {accepted}개 파일만 추가되었습니다."
      })
    },
    FilePreview: {
      title: t({
        en: 'File Viewer',
        ko: '파일 뷰어'
      }),
      emptyMessage: t({
        en: "Upload and select a file to view it here",
        ko: "여기서 볼 파일을 업로드하고 선택하세요"
      })
    }
  },
} satisfies Dictionary;

export default pageContent;
