'use client'

import {ReactElement, useState, useCallback, useEffect} from 'react';
import {useForm} from '@tanstack/react-form';
import {useIntlayer} from 'next-intlayer';
import {Dialog, DialogTitle, DialogDescription, DialogBody, DialogActions} from '@components/ui/dialog';
import {Button} from '@components/ui/button';
import {Input, InputGroup} from '@components/ui/input';
import {Slider} from '@components/ui/slider';
import {Checkbox, CheckboxField} from '@components/ui/checkbox';
import {Select} from '@components/ui/select';
import {Text} from '@components/ui/text';
import {Heading} from '@components/ui/heading';
import {Fieldset} from '@components/ui/fieldset';
import {Label} from '@components/ui/fieldset';
import {Badge} from '@components/ui/badge';
import {XMarkIcon, PlusIcon} from '@heroicons/react/16/solid';
import {
  ConfigurationValidation,
  type ConfigurationForm,
  type ImageRotationDirection,
  DEFAULT_BANNED_WORDS,
  useUserConfiguration,
  useUserConfigurationMutation
} from '@features/Configuration';

interface ConfigurationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
}

/**
 * Configuration Modal Component
 *
 * Provides a modal interface for configuring SEO and image processing settings.
 * Uses TanStack Form with Zod validation for form management.
 */
export function ConfigurationModal({
                                     isOpen,
                                     onClose
                                   }: ConfigurationModalProps): ReactElement {
  const content = useIntlayer('configuration-modal');
  const [newBannedWord, setNewBannedWord] = useState('');
  
  // Fetch user configuration data
  const { data: userConfiguration, isLoading, error } = useUserConfiguration();
  const configurationMutation = useUserConfigurationMutation();

  // Default form values
  const defaultValues: ConfigurationForm = {
    seo: {
      temperature: 5,
      bannedWords: [...DEFAULT_BANNED_WORDS]
    },
    image: {
      rotationDirection: 'clockwise' as ImageRotationDirection,
      rotationDegrees: 2,
      flipImage: false,
      enableWatermark: false,
    }
  };

  const form = useForm({
    defaultValues: {
      seo: {
        temperature: userConfiguration?.seo.temperature ?? defaultValues.seo.temperature,
        bannedWords: userConfiguration?.seo.bannedWords ?? defaultValues.seo.bannedWords
      },
      image: {
        rotationDirection: userConfiguration?.image.rotationDirection ?? defaultValues.image.rotationDirection,
        rotationDegrees: userConfiguration?.image.rotationDegrees ?? defaultValues.image.rotationDegrees,
        flipImage: userConfiguration?.image.flipImage ?? defaultValues.image.flipImage,
        enableWatermark: userConfiguration?.image.enableWatermark ?? defaultValues.image.enableWatermark,
        watermarkImage: userConfiguration?.image.watermarkImage ?? defaultValues.image.watermarkImage
      }
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        // Validate with Zod before submitting
        const validatedData = ConfigurationValidation.validateConfigurationForm(value);
        
        // Save configuration via Firestore
        await configurationMutation.mutateAsync(validatedData);
        
        // Reset form state after successful save
        formApi.reset();
        
        handleClose();
      } catch (error) {
        console.error('Failed to save configuration:', error);
        // Error handling is already done in the mutation hooks
      }
    },
    validators: {
      onChange: ({value}) => {
        try {
          ConfigurationValidation.validateConfigurationForm(value);
          return undefined;
        } catch (error) {
          return error instanceof Error ? error.message : 'Validation failed';
        }
      }
    }
  });

  const handleClose = useCallback((): void => {
    form.reset();
    setNewBannedWord('');
    onClose();
  }, [form, onClose]);

  // Initialize banned words state from query data or defaults
  const [currentBannedWords, setCurrentBannedWords] = useState<string[]>(
    userConfiguration?.seo.bannedWords ?? defaultValues.seo.bannedWords
  );

  // Update banned words state when query data changes
  useEffect(() => {
    if (userConfiguration && !isLoading) {
      setCurrentBannedWords(userConfiguration.seo.bannedWords);
    }
  }, [userConfiguration, isLoading]);

  const addBannedWord = useCallback((): void => {
    const trimmedWord = newBannedWord.trim().toLowerCase();
    if (trimmedWord && !currentBannedWords.includes(trimmedWord)) {
      const newWords = [...currentBannedWords, trimmedWord];
      form.setFieldValue('seo.bannedWords', newWords);
      setCurrentBannedWords(newWords);
      setNewBannedWord('');
    }
  }, [newBannedWord, currentBannedWords, form]);

  const removeBannedWord = useCallback((wordToRemove: string): void => {
    const newWords = currentBannedWords.filter((word: string) => word !== wordToRemove);
    form.setFieldValue('seo.bannedWords', newWords);
    setCurrentBannedWords(newWords);
  }, [currentBannedWords, form]);

  const resetToDefaultWords = useCallback((): void => {
    form.setFieldValue('seo.bannedWords', [...DEFAULT_BANNED_WORDS]);
    setCurrentBannedWords([...DEFAULT_BANNED_WORDS]);
  }, [form]);

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addBannedWord();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} size="4xl">
      <DialogTitle className="text-2xl font-bold text-gray-900">{content.Modal.title}</DialogTitle>
      <DialogDescription className="text-gray-600 mt-2">{content.Modal.description}</DialogDescription>

      <DialogBody className="space-y-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <Text className="text-gray-600">Loading configuration...</Text>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Configuration Error</h3>
                <Text className="text-red-600">
                  Failed to load configuration: {error instanceof Error ? error.message : 'Unknown error'}
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Form */}
        {!isLoading && (
          <form
            id="configuration-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-8"
          >
          {/* SEO Configuration Section */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <Fieldset>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} className="text-xl font-semibold text-gray-900">{content.SeoSection.title}</Heading>
                  <Text className="text-gray-600 mt-1">
                    {content.SeoSection.description}
                  </Text>
                </div>
              </div>

            <div className="space-y-6">
              {/* Temperature Slider */}
              <form.Field
                name="seo.temperature"
                validators={{
                  onChange: ({value}) =>
                    value < 0 || value > 10 ? content.Validation.temperatureRange : undefined,
                }}
              >
                {(field) => (
                  <div>
                    <Label>{content.SeoSection.temperatureLabel}</Label>
                    <Text className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                      {content.SeoSection.temperatureDescription}
                    </Text>
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={field.state.value}
                      onChange={field.handleChange}
                      showValue={true}
                    />
                    {field.state.meta.errors.map((error) => (
                      <Text key={error?.toString() || Math.random().toString()} className="text-red-600 text-sm mt-1">
                        {error || 'Error'}
                      </Text>
                    ))}
                  </div>
                )}
              </form.Field>

              {/* Banned Words */}
              <div>
                <Label>{content.SeoSection.bannedWordsLabel}</Label>
                <Text className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {content.SeoSection.bannedWordsDescription}
                </Text>

                {/* Add new banned word */}
                <div className="flex gap-2 mb-4">
                  <InputGroup className="flex-1">
                    <Input
                      value={newBannedWord}
                      onChange={(e) => setNewBannedWord(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={String(content.SeoSection.bannedWordsPlaceholder.value)}
                    />
                  </InputGroup>
                  <Button
                    type="button"
                    onClick={addBannedWord}
                    disabled={!newBannedWord.trim()}
                    color="blue"
                  >
                    <PlusIcon/>
                    {content.SeoSection.addWordButton}
                  </Button>
                </div>

                {/* Display banned words */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentBannedWords.map((word: string, index: number) => (
                    <Badge
                      key={`${word}-${index}`}
                      className="flex items-center gap-1 pr-1"
                    >
                      {word}
                      <button
                        type="button"
                        onClick={() => removeBannedWord(word)}
                        className="hover:bg-red-100 dark:hover:bg-red-900 rounded p-0.5 transition-colors"
                        aria-label={`${content.SeoSection.removeWordButton} ${word}`}
                      >
                        <XMarkIcon className="w-3 h-3"/>
                      </button>
                    </Badge>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={resetToDefaultWords}
                  plain
                  className="text-sm"
                >
                  {content.SeoSection.resetToDefaultButton}
                </Button>
              </div>
            </div>
            </Fieldset>
          </div>

          {/* Image Configuration Section */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <Fieldset>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} className="text-xl font-semibold text-gray-900">{content.ImageSection.title}</Heading>
                  <Text className="text-gray-600 mt-1">
                    {content.ImageSection.description}
                  </Text>
                </div>
              </div>

            <div className="space-y-6">
              {/* Rotation Direction */}
              <form.Field name="image.rotationDirection">
                {(field) => (
                  <div>
                    <Label>{content.ImageSection.rotationDirectionLabel}</Label>
                    <Select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value as ImageRotationDirection)}
                    >
                      <option value="clockwise">{content.ImageSection.clockwise}</option>
                      <option value="counter-clockwise">{content.ImageSection.counterClockwise}</option>
                    </Select>
                  </div>
                )}
              </form.Field>

              {/* Rotation Degrees */}
              <form.Field
                name="image.rotationDegrees"
                validators={{
                  onChange: ({value}) => {
                    const num = Number(value);
                    return isNaN(num) || num < 0 || num > 5 
                      ? content.Validation.rotationDegreesInvalid 
                      : undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Label>{content.ImageSection.rotationDegreesLabel}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="1"
                      value={field.state.value.toString()}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      placeholder="2"
                    />
                    {field.state.meta.errors.map((error) => (
                      <Text key={error?.toString() || Math.random().toString()} className="text-red-600 text-sm mt-1">
                        {error || 'Error'}
                      </Text>
                    ))}
                  </div>
                )}
              </form.Field>

              {/* Flip Image */}
              <form.Field name="image.flipImage">
                {(field) => (
                  <CheckboxField>
                    <Checkbox
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <Label>{content.ImageSection.flipImageLabel}</Label>
                    <Text data-slot="description" className="text-sm">
                      {content.ImageSection.flipImageDescription}
                    </Text>
                  </CheckboxField>
                )}
              </form.Field>

              {/* Enable Watermark */}
              <form.Field name="image.enableWatermark">
                {(field) => (
                  <CheckboxField>
                    <Checkbox
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <Label>{content.ImageSection.watermarkLabel}</Label>
                    <Text data-slot="description" className="text-sm">
                      {content.ImageSection.watermarkDescription}
                    </Text>
                  </CheckboxField>
                )}
              </form.Field>

              {/* Watermark Image Upload */}
              <form.Subscribe
                selector={(state) => state.values.image.enableWatermark}
              >
                {(enableWatermark) => enableWatermark && (
                  <form.Field name="image.watermarkImage">
                    {(field) => (
                      <div>
                        <Label>{content.ImageSection.watermarkImageLabel}</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // In a real app, you'd upload the file and get a URL back
                              field.handleChange(file.name);
                            }
                          }}
                        />
                      </div>
                    )}
                  </form.Field>
                )}
              </form.Subscribe>
            </div>
            </Fieldset>
          </div>
          </form>
        )}
      </DialogBody>

      <DialogActions className="bg-gray-50 rounded-b-2xl border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
        <Button 
          plain 
          onClick={handleClose}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
        >
          {content.Form.cancelButton}
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isFormSubmitting]) => (
            <Button
              type="submit"
              form="configuration-form"
              disabled={isLoading || !canSubmit || isFormSubmitting || configurationMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {(isFormSubmitting || configurationMutation.isPending) 
                ? 'Saving...' 
                : isLoading
                  ? 'Loading...'
                  : content.Form.saveButton
              }
            </Button>
          )}
        </form.Subscribe>
      </DialogActions>
    </Dialog>
  );
}