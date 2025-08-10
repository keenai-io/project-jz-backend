# Configuration Feature

This feature provides a comprehensive configuration modal for managing SEO terms and image processing settings.

## Components

### ConfigurationModal

A modal component that provides a form interface for configuring SEO and image processing settings using TanStack Form with Zod validation.

#### Features

- **SEO Configuration:**
  - Temperature slider (creativity level 0-100)
  - Use images toggle
  - Banned words management with default list

- **Image Configuration:**
  - Rotation direction (clockwise/counter-clockwise)
  - Rotation degrees (0°, 90°, 180°, 270°)
  - Flip image toggle
  - Watermark settings with file upload

- **Form Validation:**
  - Real-time validation using Zod schemas
  - TypeScript type safety
  - Error message display

#### Usage Example

```tsx
import { useState } from 'react';
import { ConfigurationModal, type ConfigurationForm } from '@features/Configuration';

export function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = async (data: ConfigurationForm): Promise<void> => {
    try {
      // Save configuration to your backend
      console.log('Saving configuration:', data);
      
      // Example API call
      await fetch('/api/configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error; // Let the modal handle the error
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Open Configuration
      </button>

      <ConfigurationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        // Optional: provide initial data for editing
        // initialData={existingConfig}
      />
    </>
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether the modal is open |
| `onClose` | `() => void` | Function to close the modal |
| `onSave` | `(data: ConfigurationForm) => Promise<void>` | Save handler that receives validated form data |
| `initialData?` | `ConfigurationForm` | Optional initial configuration data for editing |

## Data Models

### ConfigurationForm

The main form data structure:

```tsx
interface ConfigurationForm {
  name: string;
  seo: {
    temperature: number; // 0-100
    useImages: boolean;
    bannedWords: string[];
  };
  image: {
    rotationDirection: 'clockwise' | 'counter-clockwise';
    rotationDegrees: 0 | 90 | 180 | 270;
    flipImage: boolean;
    enableWatermark: boolean;
    watermarkImage?: string;
  };
}
```

### Validation

All data is validated using Zod schemas before submission:

```tsx
import { ConfigurationValidation } from '@features/Configuration';

// Validate form data
const validatedData = ConfigurationValidation.validateConfigurationForm(formData);

// Validate individual sections
const seoData = ConfigurationValidation.validateSeoConfiguration(seoFormData);
const imageData = ConfigurationValidation.validateImageConfiguration(imageFormData);
```

## Default Values

- **Temperature:** 50 (moderate creativity)
- **Use Images:** `true`
- **Banned Words:** Standard list including "cheap", "fake", "imitation", etc.
- **Rotation Direction:** "clockwise"
- **Rotation Degrees:** 0
- **Flip Image:** `false`
- **Enable Watermark:** `false`

## Internationalization

The component supports internationalization using `next-intlayer`. All text content is externalized and can be translated by modifying the content files.

## Testing

The feature includes comprehensive unit tests covering:

- Form validation and submission
- User interactions (sliders, checkboxes, inputs)
- Banned words management
- Error handling
- Initial data loading

Run tests with:
```bash
npm test features/Configuration
```

## Architecture

The feature follows vertical slice architecture:

```
features/Configuration/
├── domain/
│   └── schemas/           # Zod schemas and validation
├── presentation/          # React components and UI logic
│   ├── __tests__/        # Component tests
│   └── ConfigurationModal.content.ts  # Internationalization
└── index.ts              # Public API exports
```