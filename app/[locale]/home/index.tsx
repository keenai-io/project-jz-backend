'use client'

import { ReactElement } from 'react';
import { SpeedgoOptimizerView } from '@features/SpeedgoOptimizer';

/**
 * Home Page Component
 * 
 * Main page that renders the SpeedgoOptimizer feature view.
 * Acts as an entry point for the file upload, processing, and categorization workflow.
 */
export default function Home(): ReactElement {
  return <SpeedgoOptimizerView />;
}
