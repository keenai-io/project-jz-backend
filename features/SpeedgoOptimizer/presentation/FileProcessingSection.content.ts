import { type Dictionary, t } from "intlayer";

const fileProcessingSectionContent = {
  key: "file-processing-section",
  content: {
    processMessage: t({
      en: "Optimize products and prepare for upload into Speedgo Transmitter",
      ko: "제품을 최적화하고 Speedgo Transmitter에 업로드할 준비를 하세요"
    }),
    description: t({
      en: "Process your Excel files to categorize products and enhance keywords for better marketplace performance.",
      ko: "Excel 파일을 처리하여 제품을 분류하고 키워드를 향상시켜 마켓플레이스 성능을 개선하세요."
    }),
    processButton: t({
      en: "Process Files",
      ko: "파일 처리"
    }),
    processingButton: t({
      en: "Processing...",
      ko: "처리 중..."
    }),
  },
} satisfies Dictionary;

export default fileProcessingSectionContent;