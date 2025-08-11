import { type DeclarationContent, t } from "intlayer";

const layoutContent = {
  key: "layout",
  content: {
    navigation: {
      configurations: t({
        en: "Configurations",
        ko: "설정",
      }),
      dashboard: t({
        en: "Dashboard",
        ko: "대시보드",
      }),
    },
    userMenu: {
      support: t({
        en: "Support",
        ko: "지원",
      }),
      myProfile: t({
        en: "My profile",
        ko: "내 프로필",
      }),
      settings: t({
        en: "Settings",
        ko: "설정",
      }),
      privacyPolicy: t({
        en: "Privacy policy",
        ko: "개인정보 처리방침",
      }),
      shareFeedback: t({
        en: "Share feedback",
        ko: "피드백 공유",
      }),
      signOut: t({
        en: "Sign out",
        ko: "로그아웃",
      }),
      signingOut: t({
        en: "Signing out...",
        ko: "로그아웃 중...",
      }),
    },
    teamDropdown: {
      settings: t({
        en: "Settings",
        ko: "설정",
      }),
      tailwindLabs: t({
        en: "Tailwind Labs",
        ko: "테일윈드 랩스",
      }),
      workcation: t({
        en: "Workcation",
        ko: "워케이션",
      }),
      newTeam: t({
        en: "New team…",
        ko: "새 팀…",
      }),
    },
  },
} satisfies DeclarationContent;

export default layoutContent;