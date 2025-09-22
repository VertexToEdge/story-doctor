/**
 * API client functions for backend communication
 * 
 * @description Handles all API requests to the backend
 * Used in: Components and pages for data fetching
 * 
 * @tags api, client, fetch, http
 */

import type {
  QuestionSet,
  QuestionGenerationRequest,
  EvaluationRequest,
  EvaluationResult,
} from '@story-doctor/core';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Custom error class for API errors
 * 
 * @description Structured error with status and details
 * Used in: Error handling throughout the app
 * 
 * @tags error, api-error, custom-error
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base fetch function with error handling
 * 
 * @description Wrapper around fetch with consistent error handling
 * Used in: All API client functions
 * 
 * @tags fetch, http, base-function
 */
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        error.message || `HTTP ${response.status}`,
        error.details
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error', error);
  }
}

/**
 * Generate questions for a work
 * 
 * @description Fetches assessment questions from the API
 * Used in: Consultation start page
 * 
 * @tags api, questions, generation
 */
export async function generateQuestions(
  request: QuestionGenerationRequest
): Promise<{ questionSet: QuestionSet; sessionId: string }> {
  return apiFetch('/api/question-set', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Submit answers for evaluation
 * 
 * @description Sends answers to API and receives evaluation
 * Used in: Result calculation after completing questions
 * 
 * @tags api, evaluation, scoring
 */
export async function evaluateAnswers(
  request: EvaluationRequest
): Promise<EvaluationResult> {
  return apiFetch('/api/evaluate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get session details
 * 
 * @description Retrieves session information by ID
 * Used in: Session recovery and debugging
 * 
 * @tags api, session, get
 */
export async function getSession(
  sessionId: string
): Promise<any> {
  return apiFetch(`/api/session/${sessionId}`);
}

/**
 * Get question set by ID
 * 
 * @description Retrieves question set details
 * Used in: Question recovery and debugging
 * 
 * @tags api, questions, get
 */
export async function getQuestionSet(
  questionSetId: string
): Promise<QuestionSet> {
  return apiFetch(`/api/question-set/${questionSetId}`);
}