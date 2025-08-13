import { type Dictionary, t } from "intlayer";

const useFileProcessingContent = {
  key: "use-file-processing",
  content: {
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
    }),
    skippedTotalLimit: t({
      en: "Skipped: Total record limit of {maxRecords} reached across all files.",
      ko: "건너뜀: 모든 파일에서 총 레코드 제한 {maxRecords}개에 도달했습니다."
    }),
    noFilesProcessed: t({
      en: "No files were processed successfully. Please check the error messages for each file.",
      ko: "성공적으로 처리된 파일이 없습니다. 각 파일의 오류 메시지를 확인해 주세요."
    }),
    processingCompletedWithLimit: t({
      en: "Processing completed with record limit! {completedFiles} files successful, {errorFiles} files failed. Total: {totalProducts} products categorized from {totalRecords} records (limit: {maxRecords}).",
      ko: "레코드 제한으로 처리 완료! {completedFiles}개 파일 성공, {errorFiles}개 파일 실패. 총 {totalProducts}개 제품이 {totalRecords}개 레코드에서 분류됨 (제한: {maxRecords}개)."
    }),
    processingCompleted: t({
      en: "Processing completed! {completedFiles} files successful, {errorFiles} files failed. Total: {totalProducts} products categorized from {totalRecords} records.",
      ko: "처리 완료! {completedFiles}개 파일 성공, {errorFiles}개 파일 실패. 총 {totalProducts}개 제품이 {totalRecords}개 레코드에서 분류됨."
    })
  },
} satisfies Dictionary;

export default useFileProcessingContent;