import { FastifyInstance } from 'fastify';

async function registerPlugins(_fastify: FastifyInstance): Promise<void> {
  // Register any global plugins here
  // For example: fastify.register(somePlugin);
}

export { registerPlugins };
