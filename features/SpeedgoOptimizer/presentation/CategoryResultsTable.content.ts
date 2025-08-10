import { type Dictionary, t } from "intlayer";

const categoryResultsTableContent = {
  key: "categoryResultsTable",
  content: {
    title: t({
      en: "Categorization Results",
      ko: "카테고리화 결과"
    }),
    noResults: t({
      en: "No categorization results to display",
      ko: "표시할 카테고리화 결과가 없습니다"
    }),
    columns: {
      productNumber: t({
        en: "Product #",
        ko: "상품 번호"
      }),
      originalName: t({
        en: "Original Product Name",
        ko: "기존 상품명"
      }),
      optimizedName: t({
        en: "Optimized Product Name",
        ko: "최적화된 상품명"
      }),
      categories: t({
        en: "Categories",
        ko: "카테고리"
      }),
      keywords: t({
        en: "Enhanced Keywords",
        ko: "향상된 키워드"
      }),
      status: t({
        en: "Status",
        ko: "상태"
      }),
      categoryId: t({
        en: "Category ID",
        ko: "카테고리 ID"
      })
    },
    actions: {
      viewDetails: t({
        en: "View Details",
        ko: "상세 보기"
      }),
      exportData: t({
        en: "Export Data",
        ko: "데이터 내보내기"
      })
    },
    status: {
      onSale: t({
        en: "On Sale",
        ko: "판매 중"
      }),
      outOfStock: t({
        en: "Out of Stock",
        ko: "재고 없음"
      }),
      discontinued: t({
        en: "Discontinued",
        ko: "단종"
      })
    },
    summary: {
      showing: t({
        en: "Showing",
        ko: "표시 중"
      }),
      of: t({
        en: "of",
        ko: "/"
      }),
      products: t({
        en: "products",
        ko: "개 상품"
      })
    }
  },
} satisfies Dictionary;

export default categoryResultsTableContent;