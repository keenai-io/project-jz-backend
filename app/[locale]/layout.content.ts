import {type Dictionary, t} from "intlayer";

const pageContent = {
  key: "layout",
  content: {
    Navbar: {
      configurationTitle: t({
        en: "Configurations",
      }),
      dashboardTitle: t({
        en: "Dashboard"
      }),
    }
  },
} satisfies Dictionary;

export default pageContent;
