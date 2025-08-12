import { type Dictionary, t } from "intlayer";

const fileViewerSectionContent = {
  key: "file-viewer-section",
  content: {
    title: t({
      en: 'File Viewer',
      ko: '파일 뷰어'
    }),
    emptyMessage: t({
      en: "Upload and select a file to view it here",
      ko: "여기서 볼 파일을 업로드하고 선택하세요"
    }),
    previewTitle: t({
      en: "Preview: {fileName} (first 100 rows)",
      ko: "미리보기: {fileName} (처음 100행)"
    }),
  },
} satisfies Dictionary;

export default fileViewerSectionContent;