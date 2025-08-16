import { type Dictionary, t } from "intlayer";

const adminLayoutContent = {
  key: "admin-layout",
  content: {
    breadcrumb: {
      admin: t({
        en: "Admin",
        ko: "관리자"
      })
    },
    sidebar: {
      title: t({
        en: "Admin Tools",
        ko: "관리 도구"
      })
    },
    footer: {
      adminPanel: t({
        en: "Admin Panel",
        ko: "관리자 패널"
      }),
      version: t({
        en: "v1.0.0",
        ko: "v1.0.0"
      })
    }
  },
} satisfies Dictionary;

export default adminLayoutContent;