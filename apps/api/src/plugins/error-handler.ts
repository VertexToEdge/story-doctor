/**
 * Error handling plugin for Fastify
 * 
 * @description Centralized error handling and formatting
 * Used in: All API routes for consistent error responses
 * 
 * @tags error-handling, plugin, fastify
 */

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ZodError } from 'zod';

/**
 * Custom API error class
 * 
 * @description Structured error with status code and details
 * Used in: Route handlers for throwing meaningful errors
 * 
 * @tags error, api-error, custom-error
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error handler plugin
 * 
 * @description Handles all errors and formats responses
 * Used in: Fastify server initialization
 * 
 * @tags plugin, error-handler, middleware
 */
export async function errorHandler(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  fastify.setErrorHandler((error, request, reply) => {
    // Log error
    fastify.log.error({
      err: error,
      request: {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
      },
    });

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: error.errors,
      });
    }

    // Handle custom API errors
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
        details: error.details,
      });
    }

    // Handle Fastify errors
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: 'Request Error',
        message: error.message,
      });
    }

    // Default to 500 for unknown errors
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });
}