import { type Dictionary, t } from "intlayer";

const configurationModalContent = {
  key: "configuration-modal",
  content: {
    Modal: {
      title: t({
        en: "Configuration Settings",
      }),
      description: t({
        en: "Configure SEO and image processing settings for your products",
      }),
    },
    Form: {
      nameLabel: t({
        en: "Configuration Name",
      }),
      namePlaceholder: t({
        en: "Enter configuration name",
      }),
      saveButton: t({
        en: "Save Configuration",
      }),
      cancelButton: t({
        en: "Cancel",
      }),
    },
    SeoSection: {
      title: t({
        en: "SEO Settings",
      }),
      description: t({
        en: "Configure search engine optimization settings",
      }),
      temperatureLabel: t({
        en: "Creativity Level",
      }),
      temperatureDescription: t({
        en: "Controls the creativity of generated content (0 = Conservative, 100 = Creative)",
      }),
      useImagesLabel: t({
        en: "Use Images",
      }),
      useImagesDescription: t({
        en: "Include images in SEO optimization process",
      }),
      bannedWordsLabel: t({
        en: "Banned Words",
      }),
      bannedWordsDescription: t({
        en: "Words to remove from product names if present",
      }),
      bannedWordsPlaceholder: t({
        en: "Enter word and press Enter to add",
      }),
      addWordButton: t({
        en: "Add Word",
      }),
      removeWordButton: t({
        en: "Remove",
      }),
      resetToDefaultButton: t({
        en: "Reset to Default",
      }),
    },
    ImageSection: {
      title: t({
        en: "Image Processing",
      }),
      description: t({
        en: "Configure image transformation settings",
      }),
      rotationLabel: t({
        en: "Image Rotation",
      }),
      rotationDirectionLabel: t({
        en: "Rotation Direction",
      }),
      clockwise: t({
        en: "Clockwise",
      }),
      counterClockwise: t({
        en: "Counter-clockwise",
      }),
      rotationDegreesLabel: t({
        en: "Rotation Degrees",
      }),
      flipImageLabel: t({
        en: "Flip Image",
      }),
      flipImageDescription: t({
        en: "Mirror the image horizontally",
      }),
      watermarkLabel: t({
        en: "Enable Watermark",
      }),
      watermarkDescription: t({
        en: "Add watermark to processed images",
      }),
      watermarkImageLabel: t({
        en: "Watermark Image",
      }),
      uploadWatermarkButton: t({
        en: "Upload Watermark",
      }),
    },
    Validation: {
      nameRequired: t({
        en: "Configuration name is required",
      }),
      temperatureRange: t({
        en: "Temperature must be between 0 and 100",
      }),
      rotationDegreesInvalid: t({
        en: "Rotation degrees must be 0, 90, 180, or 270",
      }),
      wordAlreadyExists: t({
        en: "This word is already in the banned words list",
      }),
      wordTooShort: t({
        en: "Word must be at least 1 character long",
      }),
    },
    Messages: {
      saveSuccess: t({
        en: "Configuration saved successfully",
      }),
      saveError: t({
        en: "Failed to save configuration. Please try again.",
      }),
      loadError: t({
        en: "Failed to load configuration",
      }),
    },
  },
} satisfies Dictionary;

export default configurationModalContent;