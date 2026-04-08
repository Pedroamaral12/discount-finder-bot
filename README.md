# Discount Finder Bot

A modern Node.js application that sends discount notifications to Telegram channels using Fastify, Drizzle ORM, and TypeScript.

## Features

- 🚀 **Fastify** - High-performance web framework
- 🗄️ **Drizzle ORM** - Type-safe SQL toolkit
- 📝 **TypeScript** - Type safety and better development experience
- 🤖 **Telegram Bot** - Automated discount notifications
- 📊 **Redis Queue** - Message queuing system
- 📈 **Database Logging** - Comprehensive message and error tracking
- 🏥 **Health Checks** - Service monitoring endpoints

## Architecture

```
src/
├── config/          # Configuration management with Zod validation
├── database/        # Drizzle ORM schema and connection
├── jobs/           # Background jobs (Telegram notifications)
├── services/        # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── plugins/        # Fastify plugins
├── routes/         # API routes
└── server.ts       # Application entry point
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Telegram Bot Token

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Pedroamaral12/discount-finder-bot.git
cd discount-finder-bot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env_example_development .env
```

Edit `.env` with your configuration:
```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=your_channel_id_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/discount_finder_bot

# Server Configuration
PORT=3000
HOST=localhost
NODE_ENV=development

# Job Configuration
MESSAGE_INTERVAL_MINUTES=1
```

## Database Setup

1. Generate database migrations:
```bash
npm run db:generate
```

2. Run migrations:
```bash
npm run db:migrate
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot reload enabled.

## Production

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Docker

### Using Docker Compose

1. Build and start all services:
```bash
npm run docker:run
```

2. Stop services:
```bash
npm run docker:down
```

### Using Docker

1. Build the image:
```bash
npm run docker:build
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env discount-finder-bot
```

## API Endpoints

### Health Check
```
GET /health
```

Returns the application status and service health.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|-----------|---------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot API token | Yes | - |
| `TELEGRAM_CHANNEL_ID` | Target Telegram channel ID | Yes | - |
| `REDIS_URL` | Redis connection URL | No | `redis://localhost:6379` |
| `DATABASE_URL` | PostgreSQL connection string | No | `postgresql://localhost:5432/discount_finder_bot` |
| `PORT` | Server port | No | `3000` |
| `HOST` | Server host | No | `localhost` |
| `NODE_ENV` | Environment | No | `development` |
| `MESSAGE_INTERVAL_MINUTES` | Message sending interval | No | `1` |

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Start with Docker Compose
- `npm run docker:down` - Stop Docker Compose

## Best Practices Implemented

- **Type Safety**: Full TypeScript implementation with strict mode
- **Error Handling**: Comprehensive error handling with proper types
- **Resource Management**: Proper cleanup and connection management
- **Configuration Management**: Environment-based configuration with validation
- **Database Schema**: Type-safe database operations with Drizzle ORM
- **Security**: Environment variable validation and secure defaults
- **Performance**: Optimized queries and connection pooling
- **Monitoring**: Health checks and system status tracking