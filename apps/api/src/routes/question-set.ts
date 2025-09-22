/**
 * Question set generation route
 * 
 * @description Endpoint for generating assessment questions
 * Used in: Frontend to fetch questions for a work
 * 
 * @tags route, questions, generation, api
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  QuestionGenerationRequestSchema,
  getWorkById,
  generateId,
  type QuestionGenerationRequest,
  type QuestionSet,
  type Session,
} from '@story-doctor/core';
import { generateQuestions } from '../services/llm';
import { questionSetStorage, sessionStorage } from '../services/storage';
import { ApiError } from '../plugins/error-handler';

/**
 * Register question set routes
 * 
 * @description Sets up POST /question-set endpoint
 * Used in: Main server route registration
 * 
 * @tags route, registration, fastify
 */
export async function questionSetRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  /**
   * POST /api/question-set
   * Generate questions for a work
   */
  fastify.post<{
    Body: QuestionGenerationRequest;
    Reply: {
      questionSet: QuestionSet;
      sessionId: string;
    };
  }>('/question-set', {
    handler: async (request, reply) => {
      // Validate request body with Zod
      const parseResult = QuestionGenerationRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        throw new ApiError(400, 'Invalid request body', parseResult.error.errors);
      }
      const { workId, lang = 'ko' } = parseResult.data;

      // Validate work exists
      const work = getWorkById(workId);
      if (!work) {
        throw new ApiError(404, `Work not found: ${workId}`);
      }

      try {
        // Check if we have recent questions for this work (cache)
        const cacheKey = `questions:${workId}:${lang}`;
        let questionSet = questionSetStorage.getByWorkId(workId);

        if (!questionSet) {
          // Generate new questions
          fastify.log.info(`Generating questions for work: ${workId}`);
          questionSet = await generateQuestions(work, lang);
          
          // Store in cache
          questionSetStorage.set(questionSet);
        } else {
          fastify.log.info(`Using cached questions for work: ${workId}`);
        }

        // Create new session
        const session: Session = {
          id: generateId(),
          workId,
          questionSetId: questionSet.id,
          answers: [],
          startedAt: new Date(),
        };

        // Store session
        sessionStorage.set(session);

        return reply.status(200).send({
          questionSet,
          sessionId: session.id,
        });
      } catch (error) {
        fastify.log.error({ err: error }, 'Question generation error');
        
        if (error instanceof ApiError) {
          throw error;
        }
        
        throw new ApiError(500, 'Failed to generate questions');
      }
    },
  });

  /**
   * GET /api/question-set/:id
   * Retrieve existing question set
   */
  fastify.get<{
    Params: { id: string };
    Reply: QuestionSet;
  }>('/question-set/:id', {
    handler: async (request, reply) => {
      const { id } = request.params;
      
      const questionSet = questionSetStorage.get(id);
      if (!questionSet) {
        throw new ApiError(404, `Question set not found: ${id}`);
      }
      
      return reply.status(200).send(questionSet);
    },
  });
}