import '@testing-library/jest-dom';

// Mock Next.js router
import { vi } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock Next.js image component
vi.mock('next/image', () => ({
  default: (props: any) => props,
}));

// Mock next-intlayer
vi.mock('next-intlayer', () => ({
  useIntlayer: vi.fn((key: string) => {
    // Return mock content based on key
    const mockContent: Record<string, any> = {
      home: {
        FilePicker: {
          filePickerMessage: 'Drag and Drop to Upload, or click to select files',
          processMessage: 'Optimize products and prepare for upload into Speedgo Transmitter',
          processButtonMessage: 'Process',
        },
        FilePreview: {
          title: 'File Viewer',
          emptyMessage: 'Upload and select a file to view it here',
        },
      },
    };
    return mockContent[key] || {};
  }),
}));

// Mock winston logger
vi.mock('@/lib/logger.server', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    apiError: vi.fn(),
    apiRequest: vi.fn(),
    categorization: vi.fn(),
  },
}));

vi.mock('@/lib/logger.client', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');