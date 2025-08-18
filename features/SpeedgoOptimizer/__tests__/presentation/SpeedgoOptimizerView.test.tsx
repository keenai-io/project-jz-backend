/**
 * @fileoverview Tests for SpeedgoOptimizerView component
 * @module features/SpeedgoOptimizer/__tests__/presentation/SpeedgoOptimizerView.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpeedgoOptimizerView } from '../../presentation/SpeedgoOptimizerView';

// Mock the SpeedgoOptimizer hooks
vi.mock('../../hooks/useFileManagement', () => ({
  useFileManagement: vi.fn(() => ({
    files: [],
    previewFileIndex: null,
    previewRows: [],
    onDrop: vi.fn(),
    onDeleteFile: vi.fn(),
    onPreviewFile: vi.fn()
  }))
}));

vi.mock('../../hooks/useFileProcessing', () => ({
  useFileProcessing: vi.fn(() => ({
    processingResult: null,
    categorizationResults: null,
    individualResults: [],
    isProcessing: false,
    selectedLanguage: null,
    setSelectedLanguage: vi.fn(),
    handleProcessFiles: vi.fn()
  }))
}));

// Mock the presentation components
vi.mock('../../presentation/FileUploadArea', () => ({
  FileUploadArea: vi.fn(({ onDrop }) => (
    <div data-testid="file-upload-area">
      Upload Area
      <button onClick={() => onDrop([])}>Upload</button>
    </div>
  ))
}));

vi.mock('../../presentation/UploadedFilesList', () => ({
  UploadedFilesList: vi.fn(() => (
    <div data-testid="uploaded-files-list">Uploaded Files List</div>
  ))
}));

vi.mock('../../presentation/FileProcessingSection', () => ({
  FileProcessingSection: vi.fn(() => (
    <div data-testid="file-processing-section">File Processing Section</div>
  ))
}));

vi.mock('../../presentation/FileViewerSection', () => ({
  FileViewerSection: vi.fn(() => (
    <div data-testid="file-viewer-section">File Viewer Section</div>
  ))
}));

vi.mock('../../presentation/CategorizationResultsSection', () => ({
  CategorizationResultsSection: vi.fn(() => (
    <div data-testid="categorization-results-section">Categorization Results Section</div>
  ))
}));

vi.mock('../../presentation/IndividualFileStatusSection', () => ({
  IndividualFileStatusSection: vi.fn(() => (
    <div data-testid="individual-file-status-section">Individual File Status Section</div>
  ))
}));

/**
 * Test suite for SpeedgoOptimizerView component.
 * 
 * Tests the main view component that orchestrates the entire SpeedgoOptimizer workflow.
 */
describe('SpeedgoOptimizerView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Tests that the component renders without errors.
   */
  it('should render without errors', () => {
    render(<SpeedgoOptimizerView />);
    
    // Should not throw any errors and should render basic structure
    expect(document.body).toBeInTheDocument();
  });

  /**
   * Tests that all main sections are rendered.
   */
  it('should render all main sections', () => {
    render(<SpeedgoOptimizerView />);
    
    // Should render the file upload area (since no files are uploaded)
    expect(screen.getByTestId('file-upload-area')).toBeInTheDocument();
    
    // Should render the processing section
    expect(screen.getByTestId('file-processing-section')).toBeInTheDocument();
    
    // Should render the file viewer section
    expect(screen.getByTestId('file-viewer-section')).toBeInTheDocument();
  });

  /**
   * Tests that the component has proper responsive layout structure.
   */
  it('should have proper responsive layout structure', () => {
    render(<SpeedgoOptimizerView />);
    
    // Should have the main container with proper classes
    const mainContainer = document.querySelector('.max-w-7xl.mx-auto');
    expect(mainContainer).toBeInTheDocument();
    
    // Should have grid layout for upload and process sections
    const gridContainer = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });

  /**
   * Tests that component structure matches expected layout.
   */
  it('should have expected component structure', () => {
    render(<SpeedgoOptimizerView />);
    
    // Should have main sections in proper order
    const container = document.querySelector('.max-w-7xl');
    expect(container).toBeInTheDocument();
    
    // Should have upload and processing areas
    expect(screen.getByTestId('file-upload-area')).toBeInTheDocument();
    expect(screen.getByTestId('file-processing-section')).toBeInTheDocument();
    expect(screen.getByTestId('file-viewer-section')).toBeInTheDocument();
  });
});