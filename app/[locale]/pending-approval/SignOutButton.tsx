'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@components/ui/button';

interface SignOutButtonProps {
  children: React.ReactNode;
}

export function SignOutButton({ children }: SignOutButtonProps): React.ReactElement {
  const handleSignOut = async (): Promise<void> => {
    await signOut({ 
      callbackUrl: '/signin',
      redirect: true 
    });
  };

  return (
    <Button onClick={handleSignOut} className="w-full">
      {children}
    </Button>
  );
}