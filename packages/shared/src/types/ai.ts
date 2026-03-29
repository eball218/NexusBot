export interface AIConversation {
  id: string;
  tenantId: string;
  communityUserId: string | null;
  platform: string;
  channel: string;
  startedAt: Date;
  lastMessageAt: Date | null;
  messageCount: number;
  isImportant: boolean;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  platform: string;
  sentAt: Date;
  tokenCount: number | null;
}

export interface AIMemory {
  id: string;
  tenantId: string;
  communityUserId: string | null;
  memoryType: 'user_fact' | 'community' | 'relationship' | 'preference';
  content: string;
  confidence: number;
  createdAt: Date;
  accessCount: number;
  lastAccessedAt: Date | null;
}
