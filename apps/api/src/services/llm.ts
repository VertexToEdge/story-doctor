/**
 * LLM (Gemini) service for question generation
 * 
 * @description Handles communication with Google Gemini API
 * Used in: Question generation endpoints
 * 
 * @tags llm, gemini, ai, question-generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  createQuestionGenerationPrompt,
  parseQuestionGenerationResponse,
  getFallbackQuestions,
  type Work,
  type QuestionSet,
  generateId,
} from '@story-doctor/core';
import { ApiError } from '../plugins/error-handler';

/**
 * Gemini API client singleton
 * 
 * @description Lazily initialized Gemini client
 * Used in: LLM service methods
 * 
 * @tags gemini, client, singleton
 */
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, 'Gemini API key not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate questions using LLM with timeout and fallback
 * 
 * @description Attempts to generate questions via Gemini, falls back if timeout
 * Used in: POST /api/question-set endpoint
 * 
 * @tags llm, question-generation, timeout, fallback
 */
export async function generateQuestions(
  work: Work,
  language: 'ko' | 'en' = 'ko'
): Promise<QuestionSet> {
  const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || '6000');

  try {
    // Race between LLM generation and timeout
    const questionSet = await Promise.race([
      generateWithLLM(work, language),
      timeout(timeoutMs),
    ]);

    if (questionSet) {
      return questionSet;
    }
  } catch (error) {
    console.error('LLM generation failed:', error);
    // Fall through to fallback
  }

  // Use fallback questions
  console.log('Using fallback questions for work:', work.id);
  const fallback = getFallbackQuestions(work.id);
  
  if (!fallback) {
    throw new ApiError(404, 'No questions available for this work');
  }
  
  return fallback;
}

/**
 * Generate questions using Gemini API
 * 
 * @description Direct LLM generation without fallback
 * Used in: generateQuestions function
 * 
 * @tags gemini, api-call, generation
 */
async function generateWithLLM(
  work: Work,
  language: 'ko' | 'en'
): Promise<QuestionSet> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = createQuestionGenerationPrompt(work, language);
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini');
    }
    
    const questions = parseQuestionGenerationResponse(text);
    
    // Create QuestionSet with generated IDs
    const questionSet: QuestionSet = {
      id: generateId(),
      workId: work.id,
      source: 'llm',
      language,
      createdAt: new Date(),
      questions: questions.map(q => ({
        ...q,
        id: generateId(),
      })),
    };
    
    return questionSet;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new ApiError(500, 'Failed to generate questions with LLM', error);
  }
}

/**
 * Timeout promise utility
 * 
 * @description Rejects after specified milliseconds
 * Used in: Race conditions for timeout handling
 * 
 * @tags utility, timeout, promise
 */
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);
  });
}