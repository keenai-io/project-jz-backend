import { type Dictionary, t } from "intlayer";

const errorContent = {
  key: "authError",
  content: {
    title: t({
      en: "Authentication Error",
      ko: "인증 오류",
    }),
    subtitle: t({
      en: "An error occurred during authentication",
      ko: "인증 중 오류가 발생했습니다",
    }),
    tryAgain: t({
      en: "Try Again",
      ko: "다시 시도",
    }),
    backToHome: t({
      en: "Back to Home",
      ko: "홈으로 돌아가기",
    }),
    errorMessages: {
      Configuration: t({
        en: "There is a problem with the server configuration.",
        ko: "서버 구성에 문제가 있습니다.",
      }),
      AccessDenied: t({
        en: "Access denied. You do not have permission to access this resource.",
        ko: "접근이 거부되었습니다. 이 리소스에 액세스할 권한이 없습니다.",
      }),
      Verification: t({
        en: "The verification token has expired or has already been used.",
        ko: "확인 토큰이 만료되었거나 이미 사용되었습니다.",
      }),
      Default: t({
        en: "An unexpected error occurred. Please try again.",
        ko: "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
      }),
    },
  },
} satisfies Dictionary;

export default errorContent;