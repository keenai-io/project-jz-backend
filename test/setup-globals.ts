/**
 * @fileoverview Global test setup and utilities
 * @module test/setup-globals
 */

import { vi } from 'vitest';

// JSDom + Vitest don't play well with each other. Long story short - default
// TextEncoder produces Uint8Array objects that are _different_ from the global
// Uint8Array objects, so some functions that compare their types explode.
// https://github.com/vitest-dev/vitest/issues/4043#issuecomment-1905172846
class ESBuildAndJSDOMCompatibleTextEncoder extends TextEncoder {
  constructor() {
    super();
  }

  encode(input: string) {
    if (typeof input !== "string") {
      throw new TypeError("`input` must be a string");
    }

    const decodedURI = decodeURIComponent(encodeURIComponent(input));
    const arr = new Uint8Array(decodedURI.length);
    const chars = decodedURI.split("");
    for (let i = 0; i < chars.length; i++) {
      arr[i] = decodedURI[i].charCodeAt(0);
    }
    return arr;
  }
}

global.TextEncoder = ESBuildAndJSDOMCompatibleTextEncoder;

// Ensure proper Uint8Array prototype for ESBuild
if (typeof global.Uint8Array === 'undefined') {
  global.Uint8Array = Uint8Array;
}

// Additional polyfills for environments that need them
if (typeof window !== 'undefined') {
  if (!window.TextEncoder) {
    window.TextEncoder = util.TextEncoder;
  }
  if (!window.TextDecoder) {
    window.TextDecoder = util.TextDecoder;
  }
}

// Mock ResizeObserver for UI components that use Headless UI
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver if needed
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn().mockReturnValue(''),
  })),
});

// Mock scrollTo functions for components that programmatically scroll
global.scrollTo = vi.fn();
Element.prototype.scrollTo = vi.fn();

// Mock focus-related methods for accessibility testing
HTMLElement.prototype.focus = vi.fn();
HTMLElement.prototype.blur = vi.fn();

// Mock File API for tests that need file operations
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsArrayBuffer: vi.fn(),
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
}));

// Enhanced File mock with proper arrayBuffer support
class MockFile extends File {
  constructor(content: string[], filename: string, options: { type: string }) {
    super(content, filename, options);
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const mockContent = `mock-file-content-${this.name}-${this.type}`;
    return encoder.encode(mockContent).buffer;
  }

  stream(): ReadableStream {
    const encoder = new TextEncoder();
    const mockContent = `mock-file-content-${this.name}`;
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(mockContent));
        controller.close();
      }
    });
  }
}

// Replace global File with enhanced mock
global.File = MockFile as any;

// Mock URL.createObjectURL and revokeObjectURL for file handling
global.URL = {
  ...global.URL,
  createObjectURL: vi.fn().mockReturnValue('mock-object-url'),
  revokeObjectURL: vi.fn(),
};

// Mock crypto for UUID generation in tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn().mockReturnValue('mock-uuid-1234-5678-9012'),
    getRandomValues: vi.fn().mockImplementation((arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Enhanced mock fetch for API testing with realistic responses
const mockFetch = vi.fn().mockImplementation((url: string, options?: RequestInit) => {
  // Default success response
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve({ success: true, data: [] }),
    text: () => Promise.resolve('{}'),
    clone: function() { return this; },
  } as Response);
});

global.fetch = mockFetch;

// Mock Next.js navigation to prevent JSDOM errors
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/dashboard',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    // Mock the navigation method that's causing JSDOM issues
    navigate: vi.fn(),
  },
  writable: true,
});

// Mock the global navigation object that JSDOM lacks
Object.defineProperty(global, 'navigation', {
  value: {
    navigate: vi.fn().mockResolvedValue(undefined),
    back: vi.fn(),
    forward: vi.fn(),
    reload: vi.fn(),
    canGoBack: false,
    canGoForward: false,
  },
  writable: true,
});

// Mock window.navigation for Navigation API
Object.defineProperty(window, 'navigation', {
  value: {
    navigate: vi.fn().mockResolvedValue({
      committed: Promise.resolve(),
      finished: Promise.resolve(),
    }),
    back: vi.fn().mockResolvedValue({
      committed: Promise.resolve(),
      finished: Promise.resolve(),
    }),
    forward: vi.fn().mockResolvedValue({
      committed: Promise.resolve(),
      finished: Promise.resolve(),
    }),
    reload: vi.fn().mockResolvedValue({
      committed: Promise.resolve(),
      finished: Promise.resolve(),
    }),
    canGoBack: false,
    canGoForward: false,
    currentEntry: {
      url: 'http://localhost:3000/dashboard',
      key: 'mock-key',
      id: 'mock-id',
      index: 0,
      sameDocument: true,
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  },
  writable: true,
});

// Override JSDOM's navigation implementation to prevent errors
if (typeof window !== 'undefined') {
  // Mock the problematic navigation methods that JSDOM doesn't implement
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Suppress specific JSDOM navigation errors
    if (
      message.includes('Not implemented: navigation') ||
      message.includes('navigateFetch') ||
      message.includes('HTMLHyperlinkElementUtils')
    ) {
      return; // Suppress these specific navigation warnings
    }
    originalError(...args);
  };
}

// Mock next/navigation hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard',
}));

// Console override to reduce noise in tests while keeping errors visible
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  // Allow certain error types to show for debugging
  const message = args[0]?.toString() || '';
  if (
    message.includes('act(') ||
    message.includes('Warning: ReactDOM.render') ||
    message.includes('Warning: componentWillMount')
  ) {
    return; // Suppress React development warnings in tests
  }
  originalError(...args);
};

console.warn = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  if (message.includes('act(') || message.includes('Warning:')) {
    return; // Suppress React warnings in tests
  }
  originalWarn(...args);
};

// Export test utilities
export {
  MockFile,
  mockFetch,
};