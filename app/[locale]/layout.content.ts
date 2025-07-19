import { type DeclarationContent, t } from "intlayer";

const layoutContent = {
  key: "layout",
  content: {
    navigation: {
      configurations: t({
        en: "Configurations",
        // Add other locales as needed
      }),
      dashboard: t({
        en: "Dashboard",
        // Add other locales as needed
      }),
    },
    userMenu: {
      support: t({
        en: "Support",
        // Add other locales as needed
      }),
      myProfile: t({
        en: "My profile",
        // Add other locales as needed
      }),
      settings: t({
        en: "Settings",
        // Add other locales as needed
      }),
      privacyPolicy: t({
        en: "Privacy policy",
        // Add other locales as needed
      }),
      shareFeedback: t({
        en: "Share feedback",
        // Add other locales as needed
      }),
      signOut: t({
        en: "Sign out",
        // Add other locales as needed
      }),
    },
    teamDropdown: {
      settings: t({
        en: "Settings",
        // Add other locales as needed
      }),
      tailwindLabs: t({
        en: "Tailwind Labs",
        // Add other locales as needed
      }),
      workcation: t({
        en: "Workcation",
        // Add other locales as needed
      }),
      newTeam: t({
        en: "New team…",
        // Add other locales as needed
      }),
    },
  },
} satisfies DeclarationContent;

export default layoutContent;