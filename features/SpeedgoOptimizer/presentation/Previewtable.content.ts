import {type Dictionary, t} from "intlayer";

const pageContent = {
  key: "previewTable",
  content: {
    TableHeader: {
      A: t({
        en: "Product Number",
        ko: "상품 번호"
      }),
      B: t({
        en: "Product Name",
        ko: "상품명"
      }),
      C: t({
        en: 'Hashtag',
        ko: '해시태그'
      }),
      D: t({
        en: 'Keywords',
        ko: '키워드'
      }),
      E: t({
        en: 'Image Link',
        ko: '이미지 링크'
      }),
      F: t({
        en: 'Wholesale Sale Status',
        ko: '도매 판매 상태'
      }),
      G: t({
        en: 'Category Code',
        ko: '카테고리 코드'
      }),
      H: t({
        en: 'Brand',
        ko: '브랜드'
      }),
      I: t({
        en: 'Manufacturer',
        ko: '제조사'
      }),
      J: t({
        en: 'Model',
        ko: '모델'
      }),
      K: t({
        en: 'Details',
        ko: '세부 사항'
      })

    }
  },
} satisfies Dictionary;

export default pageContent;
