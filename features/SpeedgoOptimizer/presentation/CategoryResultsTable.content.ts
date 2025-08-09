import { type Dictionary, t } from "intlayer";

const categoryResultsTableContent = {
  key: "categoryResultsTable",
  content: {
    title: t({
      en: "Categorization Results"
    }),
    noResults: t({
      en: "No categorization results to display"
    }),
    columns: {
      productNumber: t({
        en: "Product #"
      }),
      originalName: t({
        en: "Original Product Name"
      }),
      optimizedName: t({
        en: "Optimized Product Name"
      }),
      categories: t({
        en: "Categories"
      }),
      keywords: t({
        en: "Enhanced Keywords"
      }),
      status: t({
        en: "Status"
      }),
      categoryId: t({
        en: "Category ID"
      })
    },
    actions: {
      viewDetails: t({
        en: "View Details"
      }),
      exportData: t({
        en: "Export Data"
      })
    },
    status: {
      onSale: t({
        en: "On Sale"
      }),
      outOfStock: t({
        en: "Out of Stock"
      }),
      discontinued: t({
        en: "Discontinued"
      })
    },
    summary: {
      showing: t({
        en: "Showing"
      }),
      of: t({
        en: "of"
      }),
      products: t({
        en: "products"
      })
    }
  },
} satisfies Dictionary;

export default categoryResultsTableContent;