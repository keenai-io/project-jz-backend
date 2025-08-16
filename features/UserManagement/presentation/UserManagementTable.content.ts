import { type Dictionary, t } from "intlayer";

const userManagementTableContent = {
  key: "user-management-table",
  content: {
    headers: {
      name: t({
        en: "Name",
        ko: "이름"
      }),
      email: t({
        en: "Email",
        ko: "이메일"
      }),
      role: t({
        en: "Role",
        ko: "역할"
      }),
      status: t({
        en: "Status",
        ko: "상태"
      }),
      lastLogin: t({
        en: "Last Login",
        ko: "최근 로그인"
      }),
      actions: t({
        en: "Actions",
        ko: "작업"
      })
    },
    roles: {
      admin: t({
        en: "Admin",
        ko: "관리자"
      }),
      user: t({
        en: "User",
        ko: "사용자"
      })
    },
    status: {
      enabled: t({
        en: "Enabled",
        ko: "활성화"
      }),
      disabled: t({
        en: "Disabled",
        ko: "비활성화"
      })
    },
    lastLogin: {
      never: t({
        en: "Never",
        ko: "없음"
      })
    },
    joined: t({
      en: "Joined",
      ko: "가입일"
    }),
    loading: t({
      en: "Loading users...",
      ko: "사용자 로딩 중..."
    }),
    error: {
      title: t({
        en: "Failed to load users",
        ko: "사용자 로드 실패"
      }),
      unknown: t({
        en: "An unknown error occurred",
        ko: "알 수 없는 오류가 발생했습니다"
      }),
      retry: t({
        en: "Retry",
        ko: "다시 시도"
      })
    },
    empty: {
      message: t({
        en: "No users found",
        ko: "사용자를 찾을 수 없습니다"
      }),
      refresh: t({
        en: "Refresh",
        ko: "새로고침"
      })
    },
    pagination: {
      showing: t({
        en: "Showing {count} users",
        ko: "{count}명의 사용자 표시"
      }),
      previous: t({
        en: "Previous",
        ko: "이전"
      }),
      next: t({
        en: "Next",
        ko: "다음"
      })
    }
  },
} satisfies Dictionary;

export default userManagementTableContent;