import Fastify from 'fastify';
import { TelegramJob } from '@/jobs/telegramJob';
import { appConfig } from '@/config';
import { HealthCheckResponse } from '@/types';
import { registerPlugins } from '@/plugins';
import { registerRoutes } from './routes';

const fastify = Fastify({
  logger: appConfig.nodeEnv === 'development' ? {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  } : true,
});


// Initialize Telegram job
let telegramJob: TelegramJob;

async function healthCheckHandler(): Promise<HealthCheckResponse> {
  const uptime = process.uptime();
  
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    version: process.env['npm_package_version'] || '1.0.0',
    services: {
      redis: 'connected', // TODO: Implement actual health check
      telegram: 'connected', // TODO: Implement actual health check
    },
  };
}

fastify.get('/health', {
  schema: {
    description: 'Health check endpoint',
    tags: ['health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
          uptime: { type: 'number' },
          version: { type: 'string' },
          services: {
            type: 'object',
            properties: {
              redis: { type: 'string' },
              telegram: { type: 'string' },
            },
          },
        },
      },
    },
  },
}, healthCheckHandler);

const start = async (): Promise<void> => {
  try {
    // Register plugins
    await registerPlugins(fastify);
    
    // Register routes
    await registerRoutes(fastify);
    
    // Initialize Telegram job
    telegramJob = new TelegramJob(
      appConfig.telegramBotToken,
      appConfig.telegramChannelId,
      appConfig.redisUrl,
      appConfig.messageIntervalMinutes
    );
    
    await telegramJob.start();
    fastify.log.info('Telegram job started successfully');

    // Start Fastify server
    await fastify.listen({ 
      port: appConfig.port, 
      host: appConfig.host 
    });
    
    fastify.log.info(`Server listening on ${appConfig.host}:${appConfig.port}`);
  } catch (error) {
    fastify.log.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await fastify.close();
    fastify.log.info('Fastify server closed');
    process.exit(0);
  } catch (error) {
    fastify.log.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  fastify.log.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  fastify.log.error({ reason }, 'Unhandled Rejection');
  process.exit(1);
});

// Start the application
start();
