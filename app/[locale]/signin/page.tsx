'use client';

import { Suspense } from 'react';
import { useIntlayer } from 'next-intlayer';
import { Button } from '@components/ui/button';
import { Heading } from '@components/ui/heading';
import { Text } from '@components/ui/text';
import { AuthLayout } from '@components/ui/auth-layout';
import { Link } from '@components/ui/link';
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
    <div className="w-full max-w-sm">
      <div className="text-center">
        <Heading level={1}>{content.title.value}</Heading>
        <Text className="mt-2 text-zinc-500">{content.subtitle.value}</Text>
      </div>

      <div className="mt-8 space-y-4">
        <form action={handleAuthenticate}>
          <Button
            type="submit"
            className="w-full"
            color="indigo"
          >
            {content.signInWithGoogle.value}
          </Button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
          {content.backToHome.value}
        </Link>
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
      <Suspense fallback={
        <div className="w-full max-w-sm">
          <div className="text-center">
            <Heading level={1}>Sign In</Heading>
            <Text className="mt-2 text-zinc-500">Loading...</Text>
          </div>
        </div>
      }>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}