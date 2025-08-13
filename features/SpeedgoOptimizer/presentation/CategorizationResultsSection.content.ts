import { type Dictionary, t } from "intlayer";

const categorizationResultsSectionContent = {
  key: "categorization-results-section",
  content: {
    title: t({
      en: "Categorization Results",
      ko: "분류 결과",
    }),
    showingResultsFor: t({
      en: "Showing results for:",
      ko: "다음 파일의 결과 표시:",
    }),
    showingAllResults: t({
      en: "Showing results from all processed files",
      ko: "처리된 모든 파일의 결과 표시",
    }),
    showAllResultsButton: t({
      en: "Show All Results",
      ko: "모든 결과 표시",
    }),
  },
} satisfies Dictionary;

export default categorizationResultsSectionContent;