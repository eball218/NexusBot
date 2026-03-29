interface ConversationMessage {
  role: string;
  content: string;
  timestamp: number;
}

const MAX_MESSAGES = 20;
const CONVERSATION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class ShortTermMemory {
  private conversations: Map<string, ConversationMessage[]> = new Map();

  addMessage(conversationKey: string, role: string, content: string): void {
    const messages = this.conversations.get(conversationKey) ?? [];

    messages.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Trim to last MAX_MESSAGES
    if (messages.length > MAX_MESSAGES) {
      messages.splice(0, messages.length - MAX_MESSAGES);
    }

    this.conversations.set(conversationKey, messages);
  }

  getHistory(conversationKey: string): Array<{ role: string; content: string }> {
    const messages = this.conversations.get(conversationKey) ?? [];
    return messages.map(({ role, content }) => ({ role, content }));
  }

  clear(conversationKey: string): void {
    this.conversations.delete(conversationKey);
  }

  cleanup(): void {
    const now = Date.now();

    for (const [key, messages] of this.conversations.entries()) {
      if (messages.length === 0) {
        this.conversations.delete(key);
        continue;
      }

      const lastMessage = messages[messages.length - 1];
      if (now - lastMessage.timestamp > CONVERSATION_TTL_MS) {
        this.conversations.delete(key);
      }
    }
  }
}
