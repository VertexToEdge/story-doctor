/**
 * Core schemas for Story Doctor domain models
 * 
 * @description Zod schemas and TypeScript types for the story suitability assessment system
 * Used in: API endpoints and frontend forms for validation and type safety
 * 
 * @tags zod, validation, schema, types, story-assessment
 */

import { z } from 'zod';

/**
 * Question type - either binary (yes/no) or likert5 (5-point scale)
 * @tags question, type, enum
 */
export const QuestionTypeSchema = z.enum(['binary', 'likert5']);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

/**
 * Individual question in the assessment questionnaire
 * @tags question, assessment, schema
 */
export const QuestionSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1),
  type: QuestionTypeSchema,
  weight: z.number().positive().default(1.0),
  category: z.string().optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

/**
 * Complete question set for a work assessment
 * @tags question-set, assessment, llm-generated
 */
export const QuestionSetSchema = z.object({
  id: z.string().uuid(),
  workId: z.string(),
  questions: z.array(QuestionSchema).min(1).max(10),
  createdAt: z.date().default(() => new Date()),
  source: z.enum(['llm', 'fallback']).default('llm'),
  language: z.enum(['ko', 'en']).default('ko'),
});
export type QuestionSet = z.infer<typeof QuestionSetSchema>;

/**
 * Literary work information
 * @tags work, story, literature
 */
export const WorkSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string().optional(),
  genre: z.string().optional(),
  summary: z.string(),
  metadata: z.record(z.any()).optional(),
});
export type Work = z.infer<typeof WorkSchema>;

/**
 * User's answer to a question
 * @tags answer, response, user-input
 */
export const AnswerSchema = z.object({
  questionId: z.string().uuid(),
  value: z.union([
    z.boolean(), // for binary questions
    z.number().int().min(1).max(5), // for likert5 questions
  ]),
  answeredAt: z.date().default(() => new Date()),
});
export type Answer = z.infer<typeof AnswerSchema>;

/**
 * Assessment session tracking user's progress
 * @tags session, assessment, progress
 */
export const SessionSchema = z.object({
  id: z.string().uuid(),
  workId: z.string(),
  questionSetId: z.string().uuid(),
  answers: z.array(AnswerSchema),
  startedAt: z.date().default(() => new Date()),
  completedAt: z.date().optional(),
  score: z.number().min(0).max(100).optional(),
  label: z.enum(['highly_suitable', 'suitable', 'moderate', 'unsuitable']).optional(),
  reasons: z.array(z.string()).optional(),
});
export type Session = z.infer<typeof SessionSchema>;

/**
 * Evaluation result with score and interpretation
 * @tags evaluation, result, score
 */
export const EvaluationResultSchema = z.object({
  sessionId: z.string().uuid(),
  score: z.number().min(0).max(100),
  label: z.enum(['highly_suitable', 'suitable', 'moderate', 'unsuitable']),
  topReasons: z.array(z.object({
    questionId: z.string(),
    content: z.string(),
    impact: z.enum(['positive', 'negative']),
    weight: z.number(),
  })).max(2),
  tips: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  completedAt: z.date().default(() => new Date()),
});
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

/**
 * Request payload for question generation
 * @tags api, request, question-generation
 */
export const QuestionGenerationRequestSchema = z.object({
  workId: z.string(),
  lang: z.enum(['ko', 'en']).default('ko'),
});
export type QuestionGenerationRequest = z.infer<typeof QuestionGenerationRequestSchema>;

/**
 * Request payload for evaluation
 * @tags api, request, evaluation
 */
export const EvaluationRequestSchema = z.object({
  sessionId: z.string().uuid(),
  questionSetId: z.string().uuid(),
  answers: z.array(AnswerSchema),
});
export type EvaluationRequest = z.infer<typeof EvaluationRequestSchema>;