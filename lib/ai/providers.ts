import OpenAI from 'openai';
import { AIProvider, AIProviderConfig } from '@/types';

// OpenAI Client
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// xAI Client (using OpenAI-compatible API)
const xaiClient = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

export class AIProviderService {
  private provider: AIProvider;
  private client: OpenAI;

  constructor(config?: AIProviderConfig) {
    this.provider = config?.provider || 'openai';
    this.client = this.provider === 'openai' ? openaiClient : xaiClient;
  }

  async generateCaption(imageUrl: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.provider === 'openai' ? 'gpt-4o' : 'grok-vision-beta',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this image in detail. Focus on the main subjects, composition, colors, mood, and any notable elements. Keep it concise but informative.',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || 'No caption generated';
    } catch (error) {
      console.error('Caption generation error:', error);
      throw error;
    }
  }

  async generateTags(imageUrl: string, caption?: string): Promise<string[]> {
    try {
      const prompt = caption
        ? `Based on this image and its caption: "${caption}", generate 10-15 relevant tags. Return only the tags as a comma-separated list.`
        : 'Analyze this image and generate 10-15 relevant tags that describe its content, style, colors, and mood. Return only the tags as a comma-separated list.';

      const response = await this.client.chat.completions.create({
        model: this.provider === 'openai' ? 'gpt-4o' : 'grok-vision-beta',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 150,
      });

      const tagsText = response.choices[0]?.message?.content || '';
      return tagsText
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);
    } catch (error) {
      console.error('Tag generation error:', error);
      throw error;
    }
  }

  async detectNSFW(imageUrl: string): Promise<{ nsfw: boolean; score: number }> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.provider === 'openai' ? 'gpt-4o' : 'grok-vision-beta',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for NSFW content. Respond with only a JSON object: {"nsfw": true/false, "score": 0-1}',
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 50,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"nsfw": false, "score": 0}');
      return result;
    } catch (error) {
      console.error('NSFW detection error:', error);
      return { nsfw: false, score: 0 };
    }
  }

  async extractText(imageUrl: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.provider === 'openai' ? 'gpt-4o' : 'grok-vision-beta',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all visible text from this image. Return only the extracted text, preserving formatting where possible.',
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OCR error:', error);
      return '';
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openaiClient.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      // Download audio file
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mpeg' });

      const response = await openaiClient.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      return response.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  async analyzeColors(imageUrl: string): Promise<string[]> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.provider === 'openai' ? 'gpt-4o' : 'grok-vision-beta',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify the 5 dominant colors in this image. Return them as hex color codes in a comma-separated list (e.g., #FF5733, #33FF57).',
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 100,
      });

      const colorsText = response.choices[0]?.message?.content || '';
      return colorsText
        .split(',')
        .map((color) => color.trim())
        .filter((color) => color.startsWith('#'));
    } catch (error) {
      console.error('Color analysis error:', error);
      return [];
    }
  }

  // Fallback mechanism
  async withFallback<T>(
    operation: () => Promise<T>,
    fallbackProvider?: AIProvider
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (fallbackProvider && fallbackProvider !== this.provider) {
        console.log(`Falling back to ${fallbackProvider}`);
        const fallbackService = new AIProviderService({ provider: fallbackProvider });
        this.client = fallbackService.client;
        this.provider = fallbackProvider;
        return await operation();
      }
      throw error;
    }
  }
}

export const aiService = new AIProviderService();