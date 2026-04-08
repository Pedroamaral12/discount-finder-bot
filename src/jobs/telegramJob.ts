import { CronJob } from 'cron';
import { TelegramService } from '@/services/telegramService';
import { QueueService } from '@/services/queueService';
import { getMessageContent } from '@/utils/messageContent';
import { db, schema } from '@/database';

export class TelegramJob {
  private readonly cronJob: CronJob;
  private readonly telegramService: TelegramService;
  private readonly queueService: QueueService;

  constructor(
    botToken: string,
    channelId: string,
    redisUrl: string,
    intervalMinutes: number = 1
  ) {
    this.telegramService = new TelegramService(botToken, channelId);
    this.queueService = new QueueService(redisUrl);

    const cronPattern = `*/${intervalMinutes} * * * *`;
    this.cronJob = new CronJob(cronPattern, async () => {
      await this.scheduleMessage();
    });
  }

  async start(): Promise<void> {
    try {
      await this.queueService.connect();
      
      const isConnected = await this.telegramService.testConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to Telegram bot');
      }

      this.queueService.processQueue(async (message: string) => {
        await this.sendMessageWithLogging(message);
      });

      this.cronJob.start();
    } catch (error) {
      throw new Error(`Failed to start Telegram job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stop(): Promise<void> {
    this.cronJob.stop();
    await this.queueService.disconnect();
  }

  private async scheduleMessage(): Promise<void> {
    try {
      const message = getMessageContent();
      console.log(`📅 [${new Date().toISOString()}] Scheduling message: ${message}`);
      await this.queueService.addMessageToQueue(message);
      await this.logMessageToDatabase(message, 'scheduled');
    } catch (error) {
      await this.logErrorToDatabase('scheduleMessage', error);
    }
  }

  private async sendMessageWithLogging(message: string): Promise<void> {
    try {
      console.log(`📤 [${new Date().toISOString()}] Sending message: ${message}`);
      await this.telegramService.sendMessage(message);
      console.log(`✅ [${new Date().toISOString()}] Message sent successfully!`);
      await this.logMessageToDatabase(message, 'sent');
    } catch (error) {
      console.log(`❌ [${new Date().toISOString()}] Error sending message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await this.logErrorToDatabase('sendMessage', error);
      throw error;
    }
  }

  private async logMessageToDatabase(content: string, status: 'scheduled' | 'sent'): Promise<void> {
    try {
      await db.insert(schema.messages).values({
        content,
        status,
        channelId: this.telegramService['channelId'], // Access private property for logging
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to log message to database:', error);
    }
  }

  private async logErrorToDatabase(operation: string, error: unknown): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await db.insert(schema.messageLogs).values({
        messageId: 0, // Will be updated with actual message ID if available
        level: 'error',
        message: `Error in ${operation}: ${errorMessage}`,
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }
  }
}
