'use client'

import { ReactElement, ReactNode, useState } from 'react';
import { QueryErrorBoundary } from '@/app/components/error-boundaries/QueryErrorBoundary';
import { HeaderNavigation } from '@/app/components/common/HeaderNavigation';
import { ConfigurationModal } from '@features/Configuration';

interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * Client-side layout component that manages the configuration modal state
 */
export function ClientLayout({ children }: ClientLayoutProps): ReactElement {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);


  return (
    <QueryErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <HeaderNavigation onConfigurationClick={() => setIsConfigModalOpen(true)} />
        
        {/* Main Content */}
        <main className="py-8">
          {children}
        </main>
      </div>

      {/* Configuration Modal */}
      {isConfigModalOpen && (
        <ConfigurationModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}
    </QueryErrorBoundary>
  );
}