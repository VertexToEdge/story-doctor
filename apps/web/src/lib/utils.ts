/**
 * Utility functions for the web app
 * 
 * @description Common utilities and helpers
 * Used in: Throughout the application
 * 
 * @tags utils, helpers, cn
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS
 * 
 * @description Combines clsx and tailwind-merge for optimal class merging
 * Used in: All components for dynamic class names
 * 
 * @tags classnames, tailwind, merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}