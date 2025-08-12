import { type Dictionary, t } from "intlayer";

const fileUploadAreaContent = {
  key: "file-upload-area",
  content: {
    dragDropTitle: t({
      en: "Drag and Drop to Upload",
      ko: "드래그 앤 드롭으로 업로드"
    }),
    filePickerMessage: t({
      en: "Drag and Drop to Upload, or click to select files",
      ko: "드래그 및 드롭으로 업로드하거나 클릭하여 파일을 선택하세요",
    }),
    uploadButtonText: t({
      en: "Upload from Device",
      ko: "기기에서 업로드"
    }),
    fileTypeNote: t({
      en: "Speedgo Transmitter output Excel files only",
      ko: "Speedgo Transmitter 출력 Excel 파일만 가능"
    }),
  },
} satisfies Dictionary;

export default fileUploadAreaContent;