import { type Dictionary, t } from "intlayer";

const categoryResultsTableContent = {
  key: "category-results-table",
  content: {
    title: t({
      en: "Categorization Results",
      ko: "분류 결과",
    }),
    productsCount: t({
      en: "{count} products",
      ko: "{count}개 제품",
    }),
    noResults: t({
      en: "No categorization results to display",
      ko: "표시할 분류 결과가 없습니다",
    }),
    showingResults: t({
      en: "Showing {count} of {total} products",
      ko: "총 {total}개 제품 중 {count}개 표시",
    }),
    columns: {
      productNumber: t({
        en: "Product #",
        ko: "제품 번호",
      }),
      originalName: t({
        en: "Original Product Name",
        ko: "원본 제품명",
      }),
      optimizedName: t({
        en: "Optimized Product Name",
        ko: "최적화된 제품명",
      }),
      categories: t({
        en: "Categories",
        ko: "카테고리",
      }),
      keywords: t({
        en: "Enhanced Keywords",
        ko: "향상된 키워드",
      }),
      status: t({
        en: "Status",
        ko: "상태",
      }),
      categoryId: t({
        en: "Category ID",
        ko: "카테고리 ID",
      }),
    },
    statusLabels: {
      onSale: t({
        en: "On Sale",
        ko: "판매 중",
      }),
      outOfStock: t({
        en: "Out of Stock",
        ko: "품절",
      }),
      discontinued: t({
        en: "Discontinued",
        ko: "단종",
      }),
    },
    moreKeywords: t({
      en: "+{count} more",
      ko: "+{count}개 더",
    }),
    moreCategories: t({
      en: "+{count} more",
      ko: "+{count}개 더",
    }),
  },
} satisfies Dictionary;

export default categoryResultsTableContent;