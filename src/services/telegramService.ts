import { Bot } from 'grammy';
import { TelegramMessage } from '@/types';

export class TelegramService {
  private readonly bot: Bot;
  private readonly channelId: string;

  constructor(botToken: string, channelId: string) {
    this.bot = new Bot(botToken);
    this.channelId = channelId;
  }

  async sendMessage(message: string): Promise<void> {
    try {
      const telegramMessage: TelegramMessage = {
        chatId: this.channelId,
        text: message,
      };
      
      await this.bot.api.sendMessage(telegramMessage.chatId, telegramMessage.text);
    } catch (error) {
      throw new Error(`Failed to send Telegram message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.bot.api.getMe();
      return true;
    } catch (error) {
      return false;
    }
  }
}
