import { type Dictionary, t } from "intlayer";

const fileProcessingSectionContent = {
  key: "file-processing-section",
  content: {
    processMessage: t({
      en: "Optimize products and prepare for upload into Speedgo Transmitter",
      ko: "제품을 최적화하고 Speedgo Transmitter에 업로드할 준비를 하세요"
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
  },
} satisfies Dictionary;

export default fileProcessingSectionContent;