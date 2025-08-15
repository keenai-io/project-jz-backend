import {type Dictionary, t} from "intlayer";

const pendingApprovalContent = {
  key: "pending-approval",
  content: {
    title: t({
      en: "Account Pending Approval",
      ko: "계정 승인 대기 중",
    }),
    message: t({
      en: "Your account is currently pending administrator approval. Please contact an administrator to gain access to the application features.",
      ko: "귀하의 계정은 현재 관리자 승인을 대기 중입니다. 애플리케이션 기능에 액세스하려면 관리자에게 문의하십시오.",
    }),
    contactInfo: t({
      en: "If you believe this is an error, please contact support.",
      ko: "이것이 오류라고 생각되시면 지원팀에 문의하십시오.",
    }),
    signOutButton: t({
      en: "Sign Out",
      ko: "로그아웃",
    }),
  },
} satisfies Dictionary;

export default pendingApprovalContent;