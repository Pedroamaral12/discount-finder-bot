export interface AppConfig {
  port: number;
  host: string;
  telegramBotToken: string;
  telegramChannelId: string;
  redisUrl: string;
  messageIntervalMinutes: number;
  nodeEnv: 'development' | 'production' | 'test';
  geminiApiKey: string | undefined;
}

export interface QueueMessage {
  id: string;
  content: string;
  timestamp: Date;
  attempts: number;
}

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  disableWebPagePreview?: boolean;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    redis: 'connected' | 'disconnected';
    telegram: 'connected' | 'disconnected';
  };
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy';
  lastCheck: Date;
  error?: string;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  service: string;
  metadata?: Record<string, unknown>;
}

export interface PromotionData {
  link: string;           // product URL
  title: string;          // product name
  previousPrice: number;  // original price in BRL
  currentPrice: number;   // discounted price in BRL
  platform: "shopee" | "amazon";
}
