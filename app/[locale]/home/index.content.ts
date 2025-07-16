import {type Dictionary, t} from "intlayer";

const pageContent = {
  key: "home",
  content: {
    FilePicker: {
      filePickerMessage: t({
        en: "Drag and Drop to Upload, or click to select files",
      }),
      processMessage: t({
        en: "Optimize products and prepare for upload into Speedgo Transmitter"
      }),
      processButtonMessage: t({
        en: 'Process'
      }),
      pageLink: "src/app/home/index.tsx",
    },
    FilePreview: {
      title: t({
        en: 'File Viewer'
      }),
      emptyMessage: t({
        en: "Upload and select a file to view it here"
      })
    }
  },
} satisfies Dictionary;

export default pageContent;
