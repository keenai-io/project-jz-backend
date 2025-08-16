import {type Dictionary, t} from "intlayer";

const headerNavigationContent = {
  key: "header-navigation",
  content: {
    Logo: {
      text: t({
        en: "MarketplaceAI",
        ko: "마켓플레이스AI"
      })
    },
    Navigation: {
      configurations: t({
        en: "Configurations",
        ko: "설정"
      }),
      dashboard: t({
        en: "Dashboard", 
        ko: "대시보드"
      }),
      support: t({
        en: "Support",
        ko: "지원"
      }),
      signIn: t({
        en: "Sign In",
        ko: "로그인"
      })
    },
    MobileMenu: {
      openMenu: t({
        en: "Open main menu",
        ko: "메인 메뉴 열기"
      }),
      closeMenu: t({
        en: "Close main menu", 
        ko: "메인 메뉴 닫기"
      })
    },
    UserMenu: {
      myProfile: t({
        en: "My Profile",
        ko: "내 프로필"
      }),
      settings: t({
        en: "Settings",
        ko: "설정"
      }),
      privacyPolicy: t({
        en: "Privacy Policy",
        ko: "개인정보처리방침"
      }),
      shareFeedback: t({
        en: "Share Feedback",
        ko: "피드백 공유"
      }),
      signOut: t({
        en: "Sign Out",
        ko: "로그아웃"
      }),
      signingOut: t({
        en: "Signing Out...",
        ko: "로그아웃 중..."
      }),
      userManagement: t({
        en: "User Management",
        ko: "사용자 관리"
      })
    }
  },
} satisfies Dictionary;

export default headerNavigationContent;