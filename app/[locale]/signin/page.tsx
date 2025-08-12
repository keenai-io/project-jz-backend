'use client';

import { Suspense } from 'react';
import { useIntlayer } from 'next-intlayer';
import { Button } from '@components/ui/button';
import { Heading } from '@components/ui/heading';
import { Text } from '@components/ui/text';
import { AuthLayout } from '@components/ui/auth-layout';
import { authenticate } from './actions';
import { useSearchParams } from 'next/navigation';
import type { ReactElement } from 'react';

/**
 * Sign in form component that uses useSearchParams
 */
function SignInForm(): ReactElement {
  const content = useIntlayer('signin');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const handleAuthenticate = async () => {
    await authenticate(callbackUrl || undefined);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border-2 border-gray-200 p-8 sm:p-10">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">{content.brandName.value}</span>
        </div>
        <Heading level={1} className="text-2xl font-bold text-gray-900 mb-2">
          {content.title.value}
        </Heading>
        <Text className="text-gray-600">{content.subtitle.value}</Text>
      </div>

      {/* Sign In Form */}
      <div className="space-y-6">
        <form action={handleAuthenticate} className="w-full">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-xl py-3 px-4 text-base font-semibold transition-colors duration-200 cursor-pointer"
          >
            {content.signInWithGoogle.value}
          </Button>
        </form>
      </div>

    </div>
  );
}

/**
 * Loading fallback component for sign in page
 */
function SignInLoading(): ReactElement {
  const content = useIntlayer<'signin'>('signin');
  
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border-2 border-gray-200 p-8 sm:p-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">{content.brandName.value}</span>
        </div>
        <Heading level={1} className="text-2xl font-bold text-gray-900 mb-2">
          {content.title.value}
        </Heading>
        <div className="flex items-center justify-center mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <Text className="ml-2 text-gray-600">{content.loading.value}</Text>
        </div>
      </div>
    </div>
  );
}

/**
 * Sign in page component
 * 
 * Provides authentication options for users to sign in to the application.
 * Currently supports Google OAuth provider through NextAuth.
 */
export default function SignInPage(): ReactElement {
  return (
    <AuthLayout>
      <Suspense fallback={<SignInLoading />}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}