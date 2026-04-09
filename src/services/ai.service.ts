import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromotionData } from '@/types';

export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generatePromotionPost(data: PromotionData): Promise<string> {
    try {
      // Calculate discount percentage
      const discountPercentage = Math.round(((data.previousPrice - data.currentPrice) / data.previousPrice) * 100);

      // Create the prompt in Brazilian Portuguese
      const prompt = `Crie uma postagem promocional para o Telegram em português brasileiro seguindo EXATAMENTE este formato:

[frase curta e chamativa com emoji]

🔥 *${data.title}*
💸 De: ~R$ ${data.previousPrice}~
✅ Por: *R$ ${data.currentPrice}* (${discountPercentage}% OFF)
🛒 ${data.link}

[frase curta de urgência]

Regras importantes:
- Use APENAS os dados fornecidos, não invente informações
- Siga o formato EXATAMENTE como mostrado acima
- Escreva em português brasileiro
- Seja breve e direto
- Inclua emojis relevantes nas frases
- Não adicione informações extras
- Não modifique os valores fornecidos

Dados do produto:
- Título: ${data.title}
- Preço anterior: R$ ${data.previousPrice}
- Preço atual: R$ ${data.currentPrice}
- Desconto: ${discountPercentage}%
- Link: ${data.link}
- Plataforma: ${data.platform}`;

      const model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('AI service returned empty response');
      }

      return text.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate promotion post: ${error.message}`);
      }
      throw new Error('Failed to generate promotion post: Unknown error occurred');
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
