/**
 * CategoryResultsTable component for displaying product categorization results
 * 
 * Provides a comprehensive view of categorized products with enhanced keywords,
 * matched categories, and optimized product information using TanStack Table.
 * 
 * @component
 * @example
 * ```tsx
 * <CategoryResultsTable 
 *   results={categorizationResults}
 *   onProductSelect={handleProductSelect}
 * />
 * ```
 */

import { ColumnDef, getCoreRowModel, useReactTable, getSortedRowModel, SortingState } from "@tanstack/react-table";
import { CategoryResponseItem } from "@features/SpeedgoOptimizer/domain/schemas/CategoryResponse";
import { useState, ReactElement } from "react";
import { ChevronUpIcon, ChevronDownIcon, ArrowDownTrayIcon } from "@heroicons/react/16/solid";
import { exportCategorizationResultsToExcel, isExportSupported, getEstimatedExportSize, formatFileSize } from "@features/SpeedgoOptimizer/application/exportCategorizationResults";
import { Button } from "@components/ui/button";
import clientLogger from "@/lib/logger.client";

interface CategoryResultsTableProps {
  /** Array of categorization results to display */
  results: CategoryResponseItem[];
  /** Optional callback when a product row is selected */
  onProductSelect?: (product: CategoryResponseItem) => void;
}

/**
 * Renders a comprehensive table of product categorization results
 * Features sorting, formatted data display, and interactive product selection
 */
export default function CategoryResultsTable({ 
  results, 
  onProductSelect 
}: CategoryResultsTableProps): ReactElement {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Handles the export button click
   * Exports the categorization results to Excel format
   */
  const handleExport = async (): Promise<void> => {
    if (isExporting || results.length === 0) return;

    setIsExporting(true);
    
    try {
      clientLogger.info('Starting categorization results export', 'ui', {
        resultCount: results.length,
        estimatedSize: formatFileSize(getEstimatedExportSize(results))
      });

      await exportCategorizationResultsToExcel(results, {
        filename: 'categorization-results',
        includeTimestamp: true
      });

      clientLogger.info('Export completed successfully', 'ui', {
        resultCount: results.length
      });

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown export error');
      clientLogger.error('Export failed in CategoryResultsTable', errorObj, 'ui', {
        resultCount: results.length
      });
      
      // Could show a toast notification here in the future
      console.error('Export failed:', errorObj.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Define columns with proper typing and formatting
  const columns: ColumnDef<CategoryResponseItem>[] = [
    {
      accessorKey: 'product_number',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:bg-gray-50 px-2 py-1 rounded"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product #
          {column.getIsSorted() === "asc" ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : null}
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium">
          {getValue() as number}
        </span>
      ),
    },
    {
      accessorKey: 'original_product_name',
      header: 'Original Product Name',
      cell: ({ getValue }) => (
        <div className="max-w-xs">
          <div className="truncate text-sm" title={getValue() as string}>
            {getValue() as string}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'product_name',
      header: 'Optimized Product Name',
      cell: ({ getValue }) => (
        <div className="max-w-xs">
          <div className="truncate text-sm font-medium text-green-800" title={getValue() as string}>
            {getValue() as string}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'matched_categories',
      header: 'Categories',
      cell: ({ getValue }) => {
        const categories = getValue() as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {category}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                +{categories.length - 2} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'keywords',
      header: 'Enhanced Keywords',
      cell: ({ getValue }) => {
        const keywords = getValue() as string[];
        const displayKeywords = keywords.slice(0, 3);
        return (
          <div className="max-w-xs">
            <div className="text-sm text-gray-700">
              {displayKeywords.join(', ')}
              {keywords.length > 3 && (
                <span className="text-gray-500 ml-1">
                  (+{keywords.length - 3} more)
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'sales_status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const statusColor = status === 'On Sale' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800';
        return (
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'category_number',
      header: 'Category ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-gray-600">
          {getValue() as string}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No categorization results to display</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Categorization Results ({results.length} products)
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Estimated export size: {formatFileSize(getEstimatedExportSize(results))}
          </p>
        </div>
        <div className="flex gap-2">
          {isExportSupported() && (
            <Button
              onClick={handleExport}
              disabled={isExporting || results.length === 0}
              outline
              className="flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export to Excel'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  >
                    {typeof header.column.columnDef.header === 'function' 
                      ? header.column.columnDef.header(header.getContext())
                      : header.column.columnDef.header as string
                    }
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className={`hover:bg-gray-50 ${onProductSelect ? 'cursor-pointer' : ''}`}
                onClick={() => onProductSelect?.(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100"
                  >
                    {typeof cell.column.columnDef.cell === 'function'
                      ? cell.column.columnDef.cell(cell.getContext())
                      : cell.getValue() as string
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Showing {table.getRowModel().rows.length} of {results.length} products
        </p>
      </div>
    </div>
  );
}