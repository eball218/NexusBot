import Anthropic from '@anthropic-ai/sdk';
import pino from 'pino';
import { PersonalityManager } from './personality';
import { ShortTermMemory } from './memory/short-term';
import { ContextBuilder } from './context-builder';

const logger = pino({ name: 'chat-engine' });

export interface ChatEngineConfig {
  personality: Record<string, unknown>;
  tenantId: string;
  model?: string;
  maxTokens?: number;
}

export interface IncomingMessage {
  content: string;
  authorId: string;
  authorName: string;
  platform: string;
  channel: string;
}

export class ChatEngine {
  private readonly anthropic: Anthropic;
  private readonly personalityManager: PersonalityManager;
  private readonly shortTermMemory: ShortTermMemory;
  private readonly contextBuilder: ContextBuilder;
  private readonly tenantId: string;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(config: ChatEngineConfig) {
    this.tenantId = config.tenantId;
    this.model = config.model ?? 'claude-sonnet-4-20250514';
    this.maxTokens = config.maxTokens ?? 1024;
    this.anthropic = new Anthropic();
    this.personalityManager = new PersonalityManager(config.personality);
    this.shortTermMemory = new ShortTermMemory();
    this.contextBuilder = new ContextBuilder();
  }

  async respond(message: IncomingMessage): Promise<string> {
    const conversationKey = `${this.tenantId}:${message.platform}:${message.channel}`;

    this.shortTermMemory.addMessage(conversationKey, 'user', message.content);

    const systemPrompt = this.buildSystemPrompt();
    const conversationHistory = this.shortTermMemory.getHistory(conversationKey);

    const messages = this.contextBuilder.build({
      systemPrompt,
      conversationHistory,
      memories: [],
      userName: message.authorName,
      platform: message.platform,
    });

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages,
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const responseText = textBlock ? textBlock.text : '';

      this.shortTermMemory.addMessage(conversationKey, 'assistant', responseText);

      logger.info(
        { tenantId: this.tenantId, platform: message.platform, channel: message.channel },
        'Generated AI response'
      );

      return responseText;
    } catch (error) {
      logger.error(
        { tenantId: this.tenantId, error },
        'Failed to generate AI response'
      );
      return "I'm having trouble responding right now. Please try again in a moment.";
    }
  }

  private buildSystemPrompt(): string {
    return this.personalityManager.getSystemPrompt();
  }
}
