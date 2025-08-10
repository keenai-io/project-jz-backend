import { type Dictionary, t } from "intlayer";

const languageSwitcherContent = {
  key: "language-switcher",
  content: {
    switchLanguage: t({
      en: "Switch language",
      ko: "언어 변경",
    }),
    currentLanguage: t({
      en: "Current language",
      ko: "현재 언어",
    }),
    languages: {
      english: t({
        en: "English",
        ko: "영어",
      }),
      korean: t({
        en: "Korean",
        ko: "한국어",
      }),
    },
  },
} satisfies Dictionary;

export default languageSwitcherContent;