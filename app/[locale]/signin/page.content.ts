import { type Dictionary, t } from "intlayer";

const signinContent = {
  key: "signin",
  content: {
    title: t({
      en: "Sign In",
      ko: "로그인",
    }),
    subtitle: t({
      en: "Welcome back! Please sign in to your account",
      ko: "환영합니다! 계정에 로그인하세요",
    }),
    signInWithGoogle: t({
      en: "Sign in with Google",
      ko: "Google로 로그인",
    }),
    or: t({
      en: "or",
      ko: "또는",
    }),
    backToHome: t({
      en: "Back to Home",
      ko: "홈으로 돌아가기",
    }),
  },
} satisfies Dictionary;

export default signinContent;