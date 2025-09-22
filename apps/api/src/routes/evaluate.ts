/**
 * Evaluation route
 * 
 * @description Endpoint for evaluating user answers
 * Used in: Frontend to submit answers and get results
 * 
 * @tags route, evaluation, scoring, api
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  EvaluationRequestSchema,
  calculateWeightedScore,
  labelOf,
  extractTopReasons,
  generateTips,
  generateWarnings,
  generateId,
  type EvaluationRequest,
  type EvaluationResult,
} from '@story-doctor/core';
import { sessionStorage, questionSetStorage } from '../services/storage';
import { ApiError } from '../plugins/error-handler';

/**
 * Register evaluation routes
 * 
 * @description Sets up POST /evaluate endpoint
 * Used in: Main server route registration
 * 
 * @tags route, registration, fastify
 */
export async function evaluateRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  /**
   * POST /api/evaluate
   * Evaluate user answers and return results
   */
  fastify.post<{
    Body: EvaluationRequest;
    Reply: EvaluationResult;
  }>('/evaluate', {
    handler: async (request, reply) => {
      // Validate request body with Zod
      const parseResult = EvaluationRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        throw new ApiError(400, 'Invalid request body', parseResult.error.errors);
      }
      const { sessionId, questionSetId, answers } = parseResult.data;

      // Validate session exists
      const session = sessionStorage.get(sessionId);
      if (!session) {
        throw new ApiError(404, `Session not found: ${sessionId}`);
      }

      // Validate question set exists
      const questionSet = questionSetStorage.get(questionSetId);
      if (!questionSet) {
        throw new ApiError(404, `Question set not found: ${questionSetId}`);
      }

      // Validate session matches question set
      if (session.questionSetId !== questionSetId) {
        throw new ApiError(400, 'Session and question set mismatch');
      }

      // Validate all questions are answered
      const questionIds = new Set(questionSet.questions.map(q => q.id));
      const answeredIds = new Set(answers.map(a => a.questionId));
      
      for (const qId of questionIds) {
        if (!answeredIds.has(qId)) {
          throw new ApiError(400, `Missing answer for question: ${qId}`);
        }
      }

      try {
        // Calculate score
        const score = calculateWeightedScore(questionSet.questions, answers);
        
        // Determine label
        const label = labelOf(score);
        
        // Extract top reasons
        const topReasons = extractTopReasons(questionSet.questions, answers, 2);
        
        // Generate tips and warnings
        const tips = generateTips(label);
        const warnings = generateWarnings(label);
        
        // Create evaluation result
        const result: EvaluationResult = {
          sessionId,
          score,
          label,
          topReasons,
          tips,
          warnings,
          completedAt: new Date(),
        };

        // Update session with results
        sessionStorage.update(sessionId, {
          answers,
          completedAt: new Date(),
          score,
          label,
          reasons: topReasons.map(r => r.content),
        });

        fastify.log.info(`Evaluation completed for session: ${sessionId}, score: ${score}`);

        return reply.status(200).send(result);
      } catch (error) {
        fastify.log.error({ err: error }, 'Evaluation error');
        
        if (error instanceof ApiError) {
          throw error;
        }
        
        throw new ApiError(500, 'Failed to evaluate answers');
      }
    },
  });

  /**
   * GET /api/session/:id
   * Retrieve session details
   */
  fastify.get<{
    Params: { id: string };
    Reply: any;
  }>('/session/:id', {
    handler: async (request, reply) => {
      const { id } = request.params;
      
      const session = sessionStorage.get(id);
      if (!session) {
        throw new ApiError(404, `Session not found: ${id}`);
      }
      
      // Also include question set if available
      const questionSet = session.questionSetId 
        ? questionSetStorage.get(session.questionSetId)
        : null;
      
      return reply.status(200).send({
        session,
        questionSet,
      });
    },
  });

  /**
   * GET /api/sessions
   * List all sessions (debug endpoint)
   */
  if (process.env.NODE_ENV !== 'production') {
    fastify.get('/sessions', {
      handler: async (request, reply) => {
        const sessions = sessionStorage.getAll();
        return reply.status(200).send({
          count: sessions.length,
          sessions: sessions.slice(0, 10), // Return max 10 for safety
        });
      },
    });
  }
}