import { FastifyInstance } from 'fastify';

async function registerRoutes(_fastify: FastifyInstance): Promise<void> {
  // Register all routes here
  // Health check is already registered in server.ts
  
  // Example route:
  // fastify.get('/api/status', async (request, reply) => {
  //   return { status: 'running', timestamp: new Date().toISOString() };
  // });
}

export { registerRoutes };
