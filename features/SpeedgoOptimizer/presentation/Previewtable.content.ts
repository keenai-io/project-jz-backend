import {type Dictionary, t} from "intlayer";

const pageContent = {
  key: "previewTable",
  content: {
    TableHeader: {
      A: t({
        en: "Product Number",
      }),
      B: t({
        en: "Product Name"
      }),
      C: t({
        en: 'Hashtag'
      }),
      D: t({
        en: 'Keywords'
      }),
      E: t({
        en: 'Image Link'
      }),
      F: t({
        en: 'Wholesale Sale Status'
      }),
      G: t({
        en: 'Category Code'
      }),
      H: t({
        en: 'Brand'
      }),
      I: t({
        en: 'Manufacturer'
      }),
      J: t({
        en: 'Model'
      }),
      K: t({
        en: 'Details'
      })

    }
  },
} satisfies Dictionary;

export default pageContent;
