import {type IntlayerConfig, Locales} from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: [
      Locales.ENGLISH,
      Locales.KOREAN,
    ],
    defaultLocale: Locales.ENGLISH,
  },
};

export default config;
