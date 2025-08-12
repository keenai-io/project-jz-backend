import { type Dictionary, t } from "intlayer";

const configurationModalContent = {
  key: "configuration-modal",
  content: {
    Modal: {
      title: t({
        en: "Configuration Settings",
        ko: "설정 구성",
      }),
      description: t({
        en: "Configure SEO and image processing settings for your products",
        ko: "제품에 대한 SEO 및 이미지 처리 설정을 구성하세요",
      }),
    },
    Form: {
      saveButton: t({
        en: "Save Settings",
        ko: "설정 저장",
      }),
      cancelButton: t({
        en: "Cancel",
        ko: "취소",
      }),
    },
    SeoSection: {
      title: t({
        en: "SEO Settings",
        ko: "SEO 설정",
      }),
      description: t({
        en: "Configure search engine optimization settings",
        ko: "검색 엔진 최적화 설정을 구성하세요",
      }),
      temperatureLabel: t({
        en: "Temperature",
        ko: "온도",
      }),
      temperatureDescription: t({
        en: "Controls the randomness of generated content (0 = Deterministic, 10 = Creative)",
        ko: "생성된 콘텐츠의 무작위성을 제어합니다 (0 = 결정적, 10 = 창의적)",
      }),
      useImagesLabel: t({
        en: "Use Images",
        ko: "이미지 사용",
      }),
      useImagesDescription: t({
        en: "Include images in SEO optimization process",
        ko: "SEO 최적화 과정에 이미지를 포함합니다",
      }),
      bannedWordsLabel: t({
        en: "Banned Words",
        ko: "금지 단어",
      }),
      bannedWordsDescription: t({
        en: "Words to remove from product names if present",
        ko: "제품명에 있을 경우 제거할 단어들",
      }),
      bannedWordsPlaceholder: t({
        en: "new banned word",
        ko: "새 금지 단어",
      }),
      addWordButton: t({
        en: "Add Word",
        ko: "단어 추가",
      }),
      removeWordButton: t({
        en: "Remove",
        ko: "제거",
      }),
      resetToDefaultButton: t({
        en: "Reset to Default",
        ko: "기본값으로 재설정",
      }),
    },
    ImageSection: {
      title: t({
        en: "Image Processing",
        ko: "이미지 처리",
      }),
      description: t({
        en: "Configure image transformation settings",
        ko: "이미지 변환 설정을 구성하세요",
      }),
      rotationLabel: t({
        en: "Image Rotation",
        ko: "이미지 회전",
      }),
      rotationDirectionLabel: t({
        en: "Rotation Direction",
        ko: "회전 방향",
      }),
      clockwise: t({
        en: "Clockwise",
        ko: "시계 방향",
      }),
      counterClockwise: t({
        en: "Counter-clockwise",
        ko: "반시계 방향",
      }),
      rotationDegreesLabel: t({
        en: "Rotation Degrees",
        ko: "회전 각도",
      }),
      flipImageLabel: t({
        en: "Flip Image",
        ko: "이미지 뒤집기",
      }),
      flipImageDescription: t({
        en: "Mirror the image horizontally",
        ko: "이미지를 수평으로 반전시킵니다",
      }),
      watermarkLabel: t({
        en: "Enable Watermark",
        ko: "워터마크 활성화",
      }),
      watermarkDescription: t({
        en: "Add watermark to processed images",
        ko: "처리된 이미지에 워터마크를 추가합니다",
      }),
      watermarkImageLabel: t({
        en: "Watermark Image",
        ko: "워터마크 이미지",
      }),
      uploadWatermarkButton: t({
        en: "Upload Watermark",
        ko: "워터마크 업로드",
      }),
    },
    Validation: {
      temperatureRange: t({
        en: "Temperature must be between 0 and 10",
        ko: "온도는 0에서 10 사이여야 합니다",
      }),
      rotationDegreesInvalid: t({
        en: "Rotation degrees must be between -360 and 360",
        ko: "회전 각도는 -360에서 360 사이여야 합니다",
      }),
      wordAlreadyExists: t({
        en: "This word is already in the banned words list",
        ko: "이 단어는 이미 금지 단어 목록에 있습니다",
      }),
      wordTooShort: t({
        en: "Word must be at least 1 character long",
        ko: "단어는 최소 1글자 이상이어야 합니다",
      }),
    },
    Messages: {
      saveSuccess: t({
        en: "Settings saved successfully",
        ko: "설정이 성공적으로 저장되었습니다",
      }),
      saveError: t({
        en: "Failed to save settings. Please try again.",
        ko: "설정 저장에 실패했습니다. 다시 시도해 주세요.",
      }),
      loadError: t({
        en: "Failed to load settings",
        ko: "설정 로드에 실패했습니다",
      }),
    },
  },
} satisfies Dictionary;

export default configurationModalContent;