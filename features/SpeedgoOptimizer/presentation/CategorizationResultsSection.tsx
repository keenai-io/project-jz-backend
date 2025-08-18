'use client'

import { ReactElement } from 'react';
import CategoryResultsTable from '@features/SpeedgoOptimizer/presentation/CategoryResultsTable';
import { CategoryResponseItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';
import { XMarkIcon } from '@heroicons/react/16/solid';
import { useIntlayer } from 'next-intlayer';
import clientLogger from '@/lib/logger.client';

interface CategorizationResultsSectionProps {
  /** Categorization results to display */
  results: CategoryResponseItem[];
  /** Name of the selected file (if viewing individual file results) */
  selectedFileName?: string | null;
  /** Callback to clear the selected file and show all results */
  onClearSelection?: () => void;
}

/**
 * Categorization Results Section Component
 * 
 * Displays the results of product categorization in a table format.
 * Only shown when categorization results are available.
 */
export function CategorizationResultsSection({
  results,
  selectedFileName,
  onClearSelection
}: CategorizationResultsSectionProps): ReactElement {
  const content = useIntlayer<'categorization-results-section'>('categorization-results-section');
  
  const handleProductSelect = (product: CategoryResponseItem) => {
    clientLogger.info('Product selected for details', 'ui', {
      productNumber: product.product_number,
      productName: product.product_name
    });
    // Future: Could open a modal or navigate to product details
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-200 shadow-sm p-4 sm:p-6">
        
        {/* Header with file selection info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {content.title}
              </h2>
              {selectedFileName && (
                <p className="text-gray-600 mt-1">
                  {content.showingResultsFor} <span className="font-medium text-blue-600">{selectedFileName}</span>
                </p>
              )}
              {!selectedFileName && (
                <p className="text-gray-600 mt-1">
                  {content.showingAllResults}
                </p>
              )}
            </div>
            
            {selectedFileName && onClearSelection && (
              <button
                onClick={onClearSelection}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg border border-gray-300 transition-colors duration-200"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>{content.showAllResultsButton}</span>
              </button>
            )}
          </div>
        </div>

        <CategoryResultsTable
          results={results}
          onProductSelect={handleProductSelect}
        />
      </div>
    </div>
  );
}