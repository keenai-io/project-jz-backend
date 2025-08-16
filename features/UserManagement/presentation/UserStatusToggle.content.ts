import { type Dictionary, t } from "intlayer";

const userStatusToggleContent = {
  key: "user-status-toggle",
  content: {
    status: {
      enabled: t({
        en: "Enabled",
        ko: "활성화"
      }),
      disabled: t({
        en: "Disabled",
        ko: "비활성화"
      }),
      updating: t({
        en: "Updating...",
        ko: "업데이트 중..."
      })
    },
    accessibility: {
      enableUser: t({
        en: "Enable user account for {email}",
        ko: "{email} 사용자 계정 활성화"
      }),
      disableUser: t({
        en: "Disable user account for {email}",
        ko: "{email} 사용자 계정 비활성화"
      })
    },
    confirmation: {
      title: t({
        en: "Confirm Action",
        ko: "작업 확인"
      }),
      enableMessage: t({
        en: "Are you sure you want to enable access for {email}? They will be able to sign in and use the application.",
        ko: "{email}의 액세스를 활성화하시겠습니까? 사용자가 로그인하여 애플리케이션을 사용할 수 있습니다."
      }),
      disableMessage: t({
        en: "Are you sure you want to disable access for {email}? They will be signed out and unable to access the application.",
        ko: "{email}의 액세스를 비활성화하시겠습니까? 사용자가 로그아웃되고 애플리케이션에 액세스할 수 없습니다."
      }),
      enable: t({
        en: "Enable",
        ko: "활성화"
      }),
      disable: t({
        en: "Disable",
        ko: "비활성화"
      }),
      cancel: t({
        en: "Cancel",
        ko: "취소"
      }),
      processing: t({
        en: "Processing...",
        ko: "처리 중..."
      })
    },
    error: {
      unknown: t({
        en: "An error occurred while updating user status",
        ko: "사용자 상태 업데이트 중 오류가 발생했습니다"
      })
    }
  },
} satisfies Dictionary;

export default userStatusToggleContent;