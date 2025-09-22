/**
 * Core package main entry point
 * 
 * @description Exports all core functionality for Story Doctor
 * Used in: API and Web applications for domain logic and types
 * 
 * @tags core, exports, main-entry
 */

// Schema exports
export * from './schemas';

// Scoring utilities
export * from './scoring';

// Data exports
export * from './data/works';
export * from './data/fallback-questions';

// Prompt utilities
export * from './prompts';