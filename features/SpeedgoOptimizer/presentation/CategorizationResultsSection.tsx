'use client'

import { ReactElement } from 'react';
import { CategoryResultsTable } from '@features/SpeedgoOptimizer';
import { CategoryResponseItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';
import clientLogger from '@/lib/logger.client';

interface CategorizationResultsSectionProps {
  /** Categorization results to display */
  results: CategoryResponseItem[];
}

/**
 * Categorization Results Section Component
 * 
 * Displays the results of product categorization in a table format.
 * Only shown when categorization results are available.
 */
export function CategorizationResultsSection({
  results
}: CategorizationResultsSectionProps): ReactElement {
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
        <CategoryResultsTable
          results={results}
          onProductSelect={handleProductSelect}
        />
      </div>
    </div>
  );
}