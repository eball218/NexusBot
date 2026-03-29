export interface ContextMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BuildContextParams {
  systemPrompt: string;
  conversationHistory: Array<{ role: string; content: string }>;
  memories: Array<{ type: string; content: string }>;
  userName: string;
  platform: string;
}

export class ContextBuilder {
  build(params: BuildContextParams): ContextMessage[] {
    const messages: ContextMessage[] = [];

    // Prepend memory context as a user message if memories exist
    if (params.memories.length > 0) {
      const memoryLines = params.memories.map(
        (m) => `[${m.type}]: ${m.content}`
      );
      const memoryContext = [
        `Here is relevant context about the conversation:`,
        `User: ${params.userName} (on ${params.platform})`,
        `Remembered facts:`,
        ...memoryLines,
      ].join('\n');

      messages.push({ role: 'user', content: memoryContext });
      messages.push({
        role: 'assistant',
        content: 'Understood, I will keep this context in mind.',
      });
    }

    // Append conversation history
    for (const msg of params.conversationHistory) {
      const role = msg.role === 'assistant' ? 'assistant' : 'user';
      messages.push({ role, content: msg.content });
    }

    return messages;
  }
}
