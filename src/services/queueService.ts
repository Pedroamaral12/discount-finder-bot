import { createClient, RedisClientType } from 'redis';
import { QueueMessage } from '@/types';

export class QueueService {
  private readonly redisClient: RedisClientType;
  private readonly queueName = 'telegram-messages';
  private processingInterval?: NodeJS.Timeout;

  constructor(redisUrl: string) {
    this.redisClient = createClient({ url: redisUrl });
  }

  async connect(): Promise<void> {
    try {
      await this.redisClient.connect();
    } catch (error) {
      throw new Error(`Failed to connect to Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addMessageToQueue(message: string): Promise<void> {
    try {
      const queueMessage: QueueMessage = {
        id: this.generateMessageId(),
        content: message,
        timestamp: new Date(),
        attempts: 0,
      };
      
      await this.redisClient.lPush(this.queueName, JSON.stringify(queueMessage));
    } catch (error) {
      throw new Error(`Failed to add message to queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  processQueue(processMessage: (message: string) => Promise<void>): void {
    const process = async (): Promise<void> => {
      try {
        const messageData = await this.redisClient.rPop(this.queueName);
        if (messageData) {
          const queueMessage: QueueMessage = JSON.parse(messageData) as QueueMessage;
          await processMessage(queueMessage.content);
        }
      } catch (error) {
        // Log error but continue processing
        console.error('Error processing queue:', error);
      }
    };

    // Process queue continuously
    this.processingInterval = setInterval(process, 1000);
  }

  async disconnect(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    await this.redisClient.disconnect();
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
