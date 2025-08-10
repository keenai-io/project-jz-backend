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
