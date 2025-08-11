'use client';

import { useSearchParams } from 'next/navigation';
import { useIntlayer } from 'next-intlayer';
import { Button } from '@components/ui/button';
import { Heading } from '@components/ui/heading';
import { Text } from '@components/ui/text';
import { AuthLayout } from '@components/ui/auth-layout';
import { Link } from '@components/ui/link';
import { Suspense } from 'react';
import type { ReactElement } from 'react';

/**
 * Error content component that uses search params
 */
function ErrorContent(): ReactElement {
  const content = useIntlayer('authError');
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorType: string | null): string => {
    switch (errorType) {
      case 'Configuration':
        return content.errorMessages.Configuration.value;
      case 'AccessDenied':
        return content.errorMessages.AccessDenied.value;
      case 'Verification':
        return content.errorMessages.Verification.value;
      default:
        return content.errorMessages.Default.value;
    }
  };

  return (
    <div className="w-full max-w-sm text-center">
      <div className="mb-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <Heading level={1}>{content.title.value}</Heading>
        <Text className="mt-2 text-zinc-500">{getErrorMessage(error)}</Text>
      </div>

      <div className="space-y-4">
        <Button className="w-full">
          <Link href="/signin">{content.tryAgain.value}</Link>
        </Button>
        <Button outline className="w-full">
          <Link href="/">{content.backToHome.value}</Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * Authentication error page component
 * 
 * Displays authentication error messages and provides options for users
 * to retry or navigate back to the home page.
 */
export default function AuthErrorPage(): ReactElement {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorContent />
      </Suspense>
    </AuthLayout>
  );
}