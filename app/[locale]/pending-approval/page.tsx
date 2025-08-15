'use client'
import { redirect } from 'next/navigation';
import { useIntlayer } from 'next-intlayer';
import { Heading } from '@components/ui/heading';
import { Text } from '@components/ui/text';
import { SignOutButton } from './SignOutButton';
import {useSession} from "next-auth/react";

export default function PendingApprovalPage(): React.ReactElement {
  const {data: session} = useSession();
  const content = useIntlayer<'pending-approval'>('pending-approval');
  
  // If not authenticated, redirect to sign in
  if (!session?.user) {
    redirect('/signin');
  }
  
  // If user is enabled, they shouldn't be here - redirect to home
  if (session.user.enabled) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            {/* Clock icon for pending status */}
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <Heading level={2} className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {content.title.value}
          </Heading>
          
          <div className="mt-4 space-y-4">
            <Text className="text-center text-gray-600 dark:text-gray-300">
              {content.message.value}
            </Text>
            
            <Text className="text-center text-sm text-gray-500 dark:text-gray-400">
              {content.contactInfo.value}
            </Text>
          </div>
          
          <div className="mt-8">
            <SignOutButton>
              {content.signOutButton.value}
            </SignOutButton>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            <Text>
              Signed in as: {session.user.email}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}