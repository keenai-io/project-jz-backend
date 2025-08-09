/**
 * @fileoverview Tests for CategoryResultsTable component
 * @module features/SpeedgoOptimizer/presentation/__tests__/CategoryResultsTable.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryResultsTable from '@features/SpeedgoOptimizer/presentation/CategoryResultsTable';
import { CategoryResponseItem } from '@features/SpeedgoOptimizer/domain/schemas/CategoryResponse';

/**
 * Mock data for testing CategoryResultsTable component
 */
const mockCategoryResults: CategoryResponseItem[] = [
  {
    product_number: 55778307,
    original_product_name: "[G&G] BB Capybara Folding Fan Round One-Touch Fan Character Gift Portable Mini",
    original_keywords: ["Mini fan", "Summer fan", "Children's fan"],
    original_main_image_link: "https://example.com/image1.jpg",
    hashtags: ["#summer", "#fan"],
    sales_status: "On Sale",
    matched_categories: ["Digital/Electronics", "Seasonal Appliances", "Fan", "Portable Fan"],
    product_name: "Capybara Folding Hand Fan Mini USB Portable One-Touch Cooling Device",
    keywords: ["Mini USB Fan", "Laptop Fan", "Summer Fan", "Portable Fan"],
    main_image_link: "https://example.com/image1-optimized.jpg",
    category_number: "50002518",
    brand: "G&G",
    manufacturer: "G&G Corp",
    model_name: "BB Capybara Fan",
    detailed_description_editing: null
  },
  {
    product_number: 55778308,
    original_product_name: "Test Product 2",
    original_keywords: ["test", "product"],
    original_main_image_link: "https://example.com/image2.jpg",
    hashtags: [],
    sales_status: "Out of Stock",
    matched_categories: ["Test Category"],
    product_name: "Enhanced Test Product 2",
    keywords: ["enhanced", "test", "product"],
    main_image_link: "https://example.com/image2-optimized.jpg",
    category_number: "50002519",
    brand: null,
    manufacturer: null,
    model_name: null,
    detailed_description_editing: null
  }
];

/**
 * Test suite for CategoryResultsTable component.
 *
 * Tests rendering, data display, sorting functionality, and user interactions.
 * Ensures proper handling of empty data and different product states.
 */
describe('CategoryResultsTable', () => {
  /**
   * Tests basic rendering functionality with mock data.
   */
  it('should render table with categorization results', () => {
    render(<CategoryResultsTable results={mockCategoryResults} />);
    
    // Check table structure
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Categorization Results (2 products)')).toBeInTheDocument();
    
    // Check data content
    expect(screen.getByText('55778307')).toBeInTheDocument();
    expect(screen.getByText('Capybara Folding Hand Fan Mini USB Portable One-Touch Cooling Device')).toBeInTheDocument();
    expect(screen.getByText('On Sale')).toBeInTheDocument();
  });

  /**
   * Tests rendering with empty results array.
   */
  it('should handle empty results gracefully', () => {
    render(<CategoryResultsTable results={[]} />);
    
    expect(screen.getByText('No categorization results to display')).toBeInTheDocument();
  });

  /**
   * Tests column headers and sorting functionality.
   */
  it('should display sortable column headers', () => {
    render(<CategoryResultsTable results={mockCategoryResults} />);
    
    // Check for sortable product number header
    const productNumberHeader = screen.getByRole('button', { name: /product #/i });
    expect(productNumberHeader).toBeInTheDocument();
    
    // Check other headers
    expect(screen.getByText('Original Product Name')).toBeInTheDocument();
    expect(screen.getByText('Optimized Product Name')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Enhanced Keywords')).toBeInTheDocument();
  });

  /**
   * Tests product selection callback functionality.
   */
  it('should call onProductSelect when row is clicked', () => {
    const onProductSelect = vi.fn();
    render(
      <CategoryResultsTable 
        results={mockCategoryResults} 
        onProductSelect={onProductSelect} 
      />
    );
    
    // Find and click on the first row
    const firstRow = screen.getByText('55778307').closest('tr');
    expect(firstRow).toBeInTheDocument();
    
    if (firstRow) {
      firstRow.click();
      expect(onProductSelect).toHaveBeenCalledWith(mockCategoryResults[0]);
    }
  });

  /**
   * Tests proper display of category badges and keyword truncation.
   */
  it('should format categories and keywords correctly', () => {
    render(<CategoryResultsTable results={mockCategoryResults} />);
    
    // Check category badges
    expect(screen.getByText('Digital/Electronics')).toBeInTheDocument();
    expect(screen.getByText('Seasonal Appliances')).toBeInTheDocument();
    
    // Check keyword display
    expect(screen.getByText(/Mini USB Fan, Laptop Fan, Summer Fan/)).toBeInTheDocument();
    
    // Check for "more" indicators when there are additional items
    expect(screen.getByText('+2 more')).toBeInTheDocument(); // For categories
    expect(screen.getByText('(+1 more)')).toBeInTheDocument(); // For keywords
  });

  /**
   * Tests status badge styling for different sales statuses.
   */
  it('should style status badges correctly', () => {
    render(<CategoryResultsTable results={mockCategoryResults} />);
    
    const onSaleStatus = screen.getByText('On Sale');
    const outOfStockStatus = screen.getByText('Out of Stock');
    
    expect(onSaleStatus).toHaveClass('bg-green-100', 'text-green-800');
    expect(outOfStockStatus).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  /**
   * Tests table summary information display.
   */
  it('should display correct summary information', () => {
    render(<CategoryResultsTable results={mockCategoryResults} />);
    
    expect(screen.getByText('Showing 2 of 2 products')).toBeInTheDocument();
  });
});