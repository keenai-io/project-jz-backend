import { type Dictionary, t } from "intlayer";

const fileLanguageSelectorContent = {
  key: "file-language-selector",
  content: {
    label: t({
      en: "File Language",
      ko: "파일 언어",
    }),
    description: t({
      en: "Select the language of your uploaded files for better categorization results",
      ko: "더 나은 분류 결과를 위해 업로드된 파일의 언어를 선택하세요",
    }),
  },
} satisfies Dictionary;

export default fileLanguageSelectorContent;