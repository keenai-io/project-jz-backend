import { type Dictionary, t } from "intlayer";

const uploadedFilesListContent = {
  key: "uploaded-files-list",
  content: {
    filesReadyTitle: t({
      en: "Files Ready",
      ko: "파일 준비 완료"
    }),
    filesReady: t({
      en: "Files ready for processing ({current}/{max} max, ~3000 records limit):",
      ko: "처리할 파일 준비 완료 ({current}/{max} 최대, 약 3000개 레코드 제한):"
    }),
    addMoreFiles: t({
      en: "+ Add more files ({remaining} remaining)",
      ko: "+ 더 많은 파일 추가 ({remaining}개 남음)"
    }),
    currentlyPreviewing: t({
      en: "Currently previewing",
      ko: "현재 미리보기 중"
    }),
    clickToPreview: t({
      en: "Click to preview", 
      ko: "클릭하여 미리보기"
    }),
  },
} satisfies Dictionary;

export default uploadedFilesListContent;