import { db, schema } from '@/database';
import { LogEntry, LogLevel } from '@/types';

export class LoggerService {
  static async log(
    level: LogLevel,
    message: string,
    service: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      service,
      ...(metadata && { metadata }),
    };

    // Log to console for immediate feedback
    console.log(`[${level.toUpperCase()}] ${service}: ${message}`, metadata || '');

    // Log to database for persistence
    try {
      await db.insert(schema.messageLogs).values({
        messageId: 0, // System logs don't have message IDs
        level,
        message: `${service}: ${message}`,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: logEntry.timestamp,
      });
    } catch (error) {
      console.error('Failed to log to database:', error);
    }
  }

  static async error(
    message: string,
    service: string,
    error?: unknown,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await this.log('error', message, service, {
      ...metadata,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  static async info(
    message: string,
    service: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log('info', message, service, metadata);
  }

  static async debug(
    message: string,
    service: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log('debug', message, service, metadata);
  }

  static async warn(
    message: string,
    service: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log('warn', message, service, metadata);
  }
}
