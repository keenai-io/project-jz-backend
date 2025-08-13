import { type Dictionary, t } from "intlayer";

const individualFileStatusSectionContent = {
  key: "individual-file-status-section",
  content: {
    title: t({
      en: "Individual File Processing Status",
      ko: "개별 파일 처리 상태",
    }),
    description: t({
      en: "Track processing status for each file and export results individually.",
      ko: "각 파일의 처리 상태를 추적하고 결과를 개별적으로 내보냅니다.",
    }),
    summaryStats: {
      completed: t({
        en: "{count} Completed",
        ko: "{count}개 완료"
      }),
      failed: t({
        en: "{count} Failed", 
        ko: "{count}개 실패"
      }),
      totalProducts: t({
        en: "{count} Total Products",
        ko: "총 {count}개 제품"
      })
    },
    statusLabels: {
      completed: t({
        en: "Completed",
        ko: "완료"
      }),
      error: t({
        en: "Error",
        ko: "오류"
      }),
      processing: t({
        en: "Processing",
        ko: "처리 중"
      }),
      pending: t({
        en: "Pending",
        ko: "대기 중"
      }),
      unknown: t({
        en: "Unknown",
        ko: "알 수 없음"
      })
    },
    clickToView: t({
      en: "Click to view results",
      ko: "결과 보기 클릭"
    }),
    processingStatus: t({
      en: "Processing file...",
      ko: "파일 처리 중...",
    }),
    recordsToProducts: t({
      en: "{recordCount} records → {productCount} products categorized",
      ko: "{recordCount}개 레코드 → {productCount}개 제품 분류됨",
    }),
    exportButton: t({
      en: "Export",
      ko: "내보내기",
    }),
  },
} satisfies Dictionary;

export default individualFileStatusSectionContent;