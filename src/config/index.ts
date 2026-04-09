import { config } from 'dotenv';
import { AppConfig } from '@/types';

config();

function getEnvVar(key: string, required: boolean = false): string | undefined {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  const parsed = value ? parseInt(value, 10) : defaultValue;
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

export const appConfig: AppConfig = {
  port: getEnvNumber('PORT', 3000),
  host: getEnvVar('HOST') || 'localhost',
  telegramBotToken: getEnvVar('TELEGRAM_BOT_TOKEN', true)!,
  telegramChannelId: getEnvVar('TELEGRAM_CHANNEL_ID', true)!,
  redisUrl: getEnvVar('REDIS_URL') || 'redis://localhost:6379',
  messageIntervalMinutes: getEnvNumber('MESSAGE_INTERVAL_MINUTES', 1),
  nodeEnv: (getEnvVar('NODE_ENV') as 'development' | 'production' | 'test') || 'development',
  geminiApiKey: getEnvVar('GEMINI_API_KEY'),
};

export const isDevelopment = appConfig.nodeEnv === 'development';
export const isProduction = appConfig.nodeEnv === 'production';
export const isTest = appConfig.nodeEnv === 'test';
