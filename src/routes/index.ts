import { FastifyInstance } from 'fastify';
import { aiService } from '@/services/ai.service';
import { TelegramService } from '@/services/telegramService';
import { PromotionData } from '@/types';
import { db, schema } from '@/database';
import { appConfig } from '@/config';
import { eq } from 'drizzle-orm';

async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Register all routes here
  // Health check is already registered in server.ts
  
  // Create Telegram service instance
  const telegramService = new TelegramService(
    appConfig.telegramBotToken,
    appConfig.telegramChannelId
  );
  
  // Route to generate promotion post and send immediately to Telegram
  fastify.post('/api/generate-promotion', {
    schema: {
      description: 'Generate a promotion post using AI and send to Telegram',
      tags: ['ai', 'telegram'],
      body: {
        type: 'object',
        required: ['link', 'title', 'previousPrice', 'currentPrice', 'platform'],
        properties: {
          link: { type: 'string' },
          title: { type: 'string' },
          previousPrice: { type: 'number' },
          currentPrice: { type: 'number' },
          platform: { type: 'string', enum: ['shopee', 'amazon'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            post: { type: 'string' },
            sent: { type: 'boolean' },
            messageId: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const promotionData: PromotionData = request.body as PromotionData;
      
      // Generate AI post
      const generatedPost = await aiService.generatePromotionPost(promotionData);
      
      // Log message to database before sending
      const messageRecord = await db.insert(schema.messages).values({
        content: generatedPost,
        channelId: appConfig.telegramChannelId,
        status: 'pending',
        attempts: 0,
        createdAt: new Date(),
      }).returning({ id: schema.messages.id });
      
      if (!messageRecord[0]?.id) {
        throw new Error('Failed to create message record in database');
      }
      
      const messageId = messageRecord[0].id;
      let sentSuccessfully = false;
      
      try {
        // Send to Telegram immediately
        await telegramService.sendMessage(generatedPost);
        sentSuccessfully = true;
        
        // Update database record as sent
        await db.update(schema.messages)
          .set({ 
            status: 'sent', 
            sentAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(schema.messages.id, messageId));
          
        fastify.log.info(`AI-generated promotion post sent successfully to Telegram (ID: ${messageId})`);
        
      } catch (telegramError) {
        // Log Telegram error to database
        await db.insert(schema.messageLogs).values({
          messageId: messageId,
          level: 'error',
          message: `Failed to send to Telegram: ${telegramError instanceof Error ? telegramError.message : 'Unknown error'}`,
          createdAt: new Date(),
        });
        
        // Update message status to failed
        await db.update(schema.messages)
          .set({ 
            status: 'failed',
            attempts: 1,
            updatedAt: new Date()
          })
          .where(eq(schema.messages.id, messageId));
          
        fastify.log.error({ error: telegramError }, 'Failed to send AI-generated post to Telegram');
        
        // Still return the generated post but indicate send failure
        return {
          success: true,
          post: generatedPost,
          sent: false,
          messageId
        };
      }
      
      return {
        success: true,
        post: generatedPost,
        sent: sentSuccessfully,
        messageId
      };
      
    } catch (error) {
      fastify.log.error({ error }, 'Failed to generate promotion post');
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  });
}

export { registerRoutes };
