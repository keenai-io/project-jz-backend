import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts', './test/setup-globals.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Only include features directory for coverage
      include: ['features/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/.next/**',
        // Exclude test files from coverage
        'features/**/__tests__/**',
        'features/**/*.test.{ts,tsx}',
        'features/**/*.spec.{ts,tsx}',
        // Exclude type-only files
        'features/**/types/**',
        'features/**/schemas/**',
        // Exclude content files (next-intlayer translation files)
        'features/**/*.content.{ts,tsx}',
      ],
      // Set coverage thresholds for features only
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@components': resolve(__dirname, './app/components'),
      '@features': resolve(__dirname, './features'),
      '@lib': resolve(__dirname, './lib'),
      '@test': resolve(__dirname, './test'),
    },
  },
});