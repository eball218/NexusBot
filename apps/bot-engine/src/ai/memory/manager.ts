import pino from 'pino';

const logger = pino({ name: 'memory-manager' });

export interface MemoryManagerConfig {
  tenantId: string;
  enabled: boolean;
  maxMemories: number;
}

export interface MemoryEntry {
  type: string;
  content: string;
  confidence: number;
}

export class MemoryManager {
  private readonly tenantId: string;
  private readonly enabled: boolean;
  private readonly maxMemories: number;

  constructor(config: MemoryManagerConfig) {
    this.tenantId = config.tenantId;
    this.enabled = config.enabled;
    this.maxMemories = config.maxMemories;
  }

  async storeMemory(params: {
    userId?: string;
    type: string;
    content: string;
    conversationId?: string;
  }): Promise<void> {
    if (!this.enabled) return;

    logger.info(
      { tenantId: this.tenantId, type: params.type, userId: params.userId },
      'Storing memory'
    );

    // TODO: insert into ai_memories table
  }

  async recallMemories(params: {
    userId?: string;
    limit?: number;
  }): Promise<MemoryEntry[]> {
    if (!this.enabled) return [];

    logger.debug(
      { tenantId: this.tenantId, userId: params.userId, limit: params.limit },
      'Recalling memories'
    );

    // TODO: query ai_memories table
    return [];
  }

  async forgetUser(userId: string): Promise<void> {
    if (!this.enabled) return;

    logger.info(
      { tenantId: this.tenantId, userId },
      'Forgetting user memories'
    );

    // TODO: delete from ai_memories where user
  }
}
