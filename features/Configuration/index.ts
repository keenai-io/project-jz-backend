// Configuration Feature Public API

// Domain exports
export {
  type Configuration,
  type ConfigurationForm,
  type ConfigurationId,
  type SeoConfiguration,
  type ImageConfiguration,
  type ImageRotationDirection,
  ConfigurationSchema,
  ConfigurationFormSchema,
  ConfigurationValidation,
  DEFAULT_BANNED_WORDS,
} from './domain/schemas/ConfigurationSchemas';

// Presentation exports
export { ConfigurationModal } from './presentation/ConfigurationModal';
export { default as configurationModalContent } from './presentation/ConfigurationModal.content';

// Hooks exports
export {
  useConfigurations,
  useConfiguration,
  useCreateConfiguration,
  useUpdateConfiguration,
  useDeleteConfiguration,
  usePrefetchConfigurations,
} from './hooks/useConfiguration';