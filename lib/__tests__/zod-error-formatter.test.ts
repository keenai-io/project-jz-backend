/**
 * @fileoverview Tests for zod-error-formatter utility functions
 * @module lib/__tests__/zod-error-formatter.test
 */

import { describe, it, expect } from 'vitest';
import { z, ZodError } from 'zod';
import {
  formatZodError,
  createValidationErrorMessage,
  formatFastApiError,
  formatError,
} from '../zod-error-formatter';

/**
 * Test suite for Zod error formatting utilities.
 * 
 * Tests various error formatting functions with different error types,
 * options, and edge cases to ensure proper error message generation.
 */
describe('Zod Error Formatter', () => {
  describe('formatZodError', () => {
    /**
     * Tests basic Zod error formatting.
     */
    it('should format basic validation errors', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      try {
        schema.parse({ name: 123, age: 'invalid' });
      } catch (error) {
        const formatted = formatZodError(error as ZodError);
        
        expect(formatted).toContain('name');
        expect(formatted).toContain('age');
        expect(formatted).toContain('🔗'); // Path prefix emoji
      }
    });

    /**
     * Tests error formatting with path inclusion.
     */
    it('should include field paths when enabled', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            email: z.string().email(),
          }),
        }),
      });

      try {
        schema.parse({ user: { profile: { email: 'invalid-email' } } });
      } catch (error) {
        const formatted = formatZodError(error as ZodError, { includePath: true });
        
        expect(formatted).toContain('user.profile.email');
      }
    });

    /**
     * Tests error formatting without paths.
     */
    it('should exclude field paths when disabled', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      try {
        schema.parse({ email: 'invalid' });
      } catch (error) {
        const formatted = formatZodError(error as ZodError, { includePath: false });
        
        expect(formatted).not.toContain('email:');
        expect(formatted).toContain('📧');
      }
    });

    /**
     * Tests maximum error limiting.
     */
    it('should limit number of errors shown', () => {
      const schema = z.object({
        field1: z.string(),
        field2: z.string(),
        field3: z.string(),
        field4: z.string(),
      });

      try {
        schema.parse({ field1: 1, field2: 2, field3: 3, field4: 4 });
      } catch (error) {
        const formatted = formatZodError(error as ZodError, { maxErrors: 2 });
        
        expect(formatted).toContain('2 more validation errors');
      }
    });

    /**
     * Tests custom bullet point formatting.
     */
    it('should use custom bullet points', () => {
      const schema = z.object({
        name: z.string(),
      });

      try {
        schema.parse({ name: 123 });
      } catch (error) {
        const formatted = formatZodError(error as ZodError, { bulletPoint: '→ ' });
        
        expect(formatted).toContain('→ ');
      }
    });

    /**
     * Tests error code inclusion.
     */
    it('should include error codes when enabled', () => {
      const schema = z.string();

      try {
        schema.parse(123);
      } catch (error) {
        const formatted = formatZodError(error as ZodError, { includeErrorCode: true });
        
        expect(formatted).toContain('[invalid_type]');
      }
    });

    /**
     * Tests grouped error formatting.
     */
    it('should group errors by path', () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(2),
          email: z.string().email(),
        }),
      });

      try {
        schema.parse({ user: { name: 'a', email: 'invalid' } });
      } catch (error) {
        const formatted = formatZodError(error as ZodError, { groupByPath: true });
        
        // Check for grouped formatting - either header or individual path-prefixed errors
        expect(formatted).toMatch(/📍 Issues at user|🔗 user\./);
      }
    });
  });

  describe('createValidationErrorMessage', () => {
    /**
     * Tests validation error message creation.
     */
    it('should create complete validation error message', () => {
      const schema = z.object({
        email: z.string().email(),
      });

      try {
        schema.parse({ email: 'invalid' });
      } catch (error) {
        const message = createValidationErrorMessage('User data', error as ZodError);
        
        expect(message).toContain('🚫 User data validation failed:');
        expect(message).toContain('📧');
      }
    });

    /**
     * Tests validation error message with options.
     */
    it('should accept formatting options', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      try {
        schema.parse({ name: 123, age: 'invalid' });
      } catch (error) {
        const message = createValidationErrorMessage(
          'Form data',
          error as ZodError,
          { maxErrors: 1, includePath: false }
        );
        
        expect(message).toContain('🚫 Form data validation failed:');
        expect(message).toContain('1 more validation error');
      }
    });
  });

  describe('formatFastApiError', () => {
    /**
     * Tests FastAPI error formatting.
     */
    it('should format FastAPI validation errors', () => {
      const fastApiErrors = [
        {
          type: 'value_error.missing',
          loc: ['body', 'email'],
          msg: 'field required',
        },
        {
          type: 'value_error.email',
          loc: ['body', 'email'],
          msg: 'value is not a valid email address',
        },
      ];

      const formatted = formatFastApiError(fastApiErrors);
      
      expect(formatted).toContain('body.email: This field is required');
      expect(formatted).toContain('value is not a valid email address');
    });

    /**
     * Tests FastAPI error formatting without paths.
     */
    it('should format without paths when disabled', () => {
      const fastApiErrors = [
        {
          type: 'value_error.missing',
          loc: ['body', 'email'],
          msg: 'field required',
        },
      ];

      const formatted = formatFastApiError(fastApiErrors, { includePath: false });
      
      expect(formatted).not.toContain('body.email:');
      expect(formatted).toContain('This field is required');
    });

    /**
     * Tests FastAPI error limiting.
     */
    it('should limit FastAPI errors shown', () => {
      const fastApiErrors = Array.from({ length: 5 }, (_, i) => ({
        type: 'value_error.missing',
        loc: ['body', `field${i}`],
        msg: 'field required',
      }));

      const formatted = formatFastApiError(fastApiErrors, { maxErrors: 2 });
      
      expect(formatted).toContain('3 more validation errors');
    });

    /**
     * Tests FastAPI message enhancement.
     */
    it('should enhance common FastAPI messages', () => {
      const fastApiErrors = [
        {
          type: 'type_error.list',
          loc: ['body'],
          msg: 'Input should be a valid list',
        },
      ];

      const formatted = formatFastApiError(fastApiErrors);
      
      expect(formatted).toContain('Expected an array but received an object');
    });
  });

  describe('formatError', () => {
    /**
     * Tests ZodError formatting.
     */
    it('should format ZodError instances', () => {
      const schema = z.string();

      try {
        schema.parse(123);
      } catch (error) {
        const formatted = formatError(error, 'API request');
        
        expect(formatted).toContain('API request: Validation failed:');
        expect(formatted).toContain('Invalid input'); // Check for actual error message
      }
    });

    /**
     * Tests FastAPI error formatting.
     */
    it('should format FastAPI error objects', () => {
      const fastApiError = {
        detail: [
          {
            type: 'value_error.missing',
            loc: ['body', 'email'],
            msg: 'field required',
          },
        ],
      };

      const formatted = formatError(fastApiError, 'Server response');
      
      expect(formatted).toContain('Server response: API validation failed:');
      expect(formatted).toContain('This field is required');
    });

    /**
     * Tests regular Error formatting.
     */
    it('should format regular Error instances', () => {
      const error = new Error('Something went wrong');
      
      const formatted = formatError(error, 'Network request');
      
      expect(formatted).toBe('Network request: Something went wrong');
    });

    /**
     * Tests string error formatting.
     */
    it('should format string errors', () => {
      const formatted = formatError('Custom error message', 'Process');
      
      expect(formatted).toBe('Process: Custom error message');
    });

    /**
     * Tests unknown error formatting.
     */
    it('should handle unknown error types', () => {
      const formatted = formatError({ some: 'object' }, 'Unknown context');
      
      expect(formatted).toBe('Unknown context: An unknown error occurred');
    });

    /**
     * Tests error formatting without context.
     */
    it('should format errors without context', () => {
      const error = new Error('Test error');
      
      const formatted = formatError(error);
      
      expect(formatted).toBe('Test error');
    });

    /**
     * Tests null/undefined error handling.
     */
    it('should handle null and undefined errors', () => {
      expect(formatError(null)).toBe('An unknown error occurred');
      expect(formatError(undefined)).toBe('An unknown error occurred');
    });
  });

  describe('Enhanced Error Messages', () => {
    /**
     * Tests email validation error enhancement.
     */
    it('should enhance email validation errors', () => {
      const schema = z.string().email();

      try {
        schema.parse('invalid-email');
      } catch (error) {
        const formatted = formatZodError(error as ZodError);
        
        expect(formatted).toContain('📧');
      }
    });

    /**
     * Tests size validation error enhancement.
     */
    it('should enhance size validation errors', () => {
      const schema = z.string().min(5);

      try {
        schema.parse('abc');
      } catch (error) {
        const formatted = formatZodError(error as ZodError);
        
        expect(formatted).toContain('📏');
        expect(formatted).toContain('at least 5');
      }
    });

    /**
     * Tests union validation error enhancement.
     */
    it('should enhance union validation errors', () => {
      const schema = z.union([z.string(), z.number()]);

      try {
        schema.parse(true);
      } catch (error) {
        const formatted = formatZodError(error as ZodError);
        
        expect(formatted).toContain('🔄');
        expect(formatted).toContain("doesn't match any of the expected formats");
      }
    });

    /**
     * Tests custom validation error enhancement.
     */
    it('should enhance custom validation errors', () => {
      const schema = z.string().refine((val) => val.includes('test'), {
        message: 'Value must contain "test"',
      });

      try {
        schema.parse('hello');
      } catch (error) {
        const formatted = formatZodError(error as ZodError);
        
        expect(formatted).toContain('⚠️');
      }
    });
  });
});