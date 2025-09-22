/**
 * API server entry point
 * 
 * @description Main Fastify server for Story Doctor API
 * Used in: Backend service providing assessment endpoints
 * 
 * @tags api, server, fastify, main-entry
 */

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { questionSetRoutes } from './routes/question-set';
import { evaluateRoutes } from './routes/evaluate';
import { errorHandler } from './plugins/error-handler';

/**
 * Initialize and start the Fastify server
 * 
 * @description Sets up server with plugins and routes
 * Used in: Application startup
 * 
 * @tags server, initialization, startup
 */
async function start() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  await fastify.register(errorHandler);

  // Register routes
  await fastify.register(questionSetRoutes, { prefix: '/api' });
  await fastify.register(evaluateRoutes, { prefix: '/api' });

  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Start server
  const port = parseInt(process.env.PORT || '3001');
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Server is running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();