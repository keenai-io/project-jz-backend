'use client'

import {ReactElement, useState, useCallback} from 'react';
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
  DEFAULT_BANNED_WORDS
} from '@features/Configuration';

interface ConfigurationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Initial configuration data (for editing) */
  initialData?: ConfigurationForm;
  /** Save handler */
  onSave: (data: ConfigurationForm) => Promise<void>;
}

/**
 * Configuration Modal Component
 *
 * Provides a modal interface for configuring SEO and image processing settings.
 * Uses TanStack Form with Zod validation for form management.
 */
export function ConfigurationModal({
                                     isOpen,
                                     onClose,
                                     initialData,
                                     onSave
                                   }: ConfigurationModalProps): ReactElement {
  const content = useIntlayer('configuration-modal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBannedWord, setNewBannedWord] = useState('');

  // Default form values
  const defaultValues: ConfigurationForm = {
    seo: {
      temperature: 50,
      useImages: true,
      bannedWords: [...DEFAULT_BANNED_WORDS]
    },
    image: {
      rotationDirection: 'clockwise' as ImageRotationDirection,
      rotationDegrees: 25,
      flipImage: false,
      enableWatermark: false,
    }
  };

  const form = useForm({
    defaultValues: initialData || defaultValues,
    onSubmit: async ({value}) => {
      try {
        setIsSubmitting(true);
        // Validate with Zod before submitting
        const validatedData = ConfigurationValidation.validateConfigurationForm(value);
        await onSave(validatedData);
        handleClose();
      } catch (error) {
        console.error('Failed to save configuration:', error);
      } finally {
        setIsSubmitting(false);
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

  // Use Subscribe to watch form values for banned words state
  const [currentBannedWords, setCurrentBannedWords] = useState<string[]>([...DEFAULT_BANNED_WORDS]);

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
      <DialogTitle>{content.Modal.title}</DialogTitle>
      <DialogDescription>{content.Modal.description}</DialogDescription>

      <DialogBody>
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
          <Fieldset>
            <Heading level={3}>{content.SeoSection.title}</Heading>
            <Text className="text-zinc-600 dark:text-zinc-400 mb-4">
              {content.SeoSection.description}
            </Text>

            <div className="space-y-6">
              {/* Temperature Slider */}
              <form.Field
                name="seo.temperature"
                validators={{
                  onChange: ({value}) =>
                    value < 0 || value > 100 ? content.Validation.temperatureRange : undefined,
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
                      max={100}
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

              {/* Use Images Checkbox */}
              <form.Field name="seo.useImages">
                {(field) => (
                  <CheckboxField>
                    <Checkbox
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <Label>{content.SeoSection.useImagesLabel}</Label>
                    <Text data-slot="description" className="text-sm">
                      {content.SeoSection.useImagesDescription}
                    </Text>
                  </CheckboxField>
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

          {/* Image Configuration Section */}
          <Fieldset>
            <Heading level={3}>{content.ImageSection.title}</Heading>
            <Text className="text-zinc-600 dark:text-zinc-400 mb-4">
              {content.ImageSection.description}
            </Text>

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
                    return isNaN(num) || num < -360 || num > 360 
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
                      min="-360"
                      max="360"
                      step="1"
                      value={field.state.value.toString()}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      placeholder="25"
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
        </form>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={handleClose}>
          {content.Form.cancelButton}
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isFormSubmitting]) => (
            <Button
              type="submit"
              form="configuration-form"
              disabled={!canSubmit || isFormSubmitting || isSubmitting}
              color="blue"
            >
              {(isFormSubmitting || isSubmitting) ? 'Saving...' : content.Form.saveButton}
            </Button>
          )}
        </form.Subscribe>
      </DialogActions>
    </Dialog>
  );
}