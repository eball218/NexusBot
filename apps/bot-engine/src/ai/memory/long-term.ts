import pino from 'pino';

const logger = pino({ name: 'long-term-memory' });

export interface LongTermFact {
  userId?: string;
  type: string;
  content: string;
}

export interface RecalledMemory {
  content: string;
  type: string;
  confidence: number;
}

export class LongTermMemory {
  async store(
    tenantId: string,
    fact: LongTermFact
  ): Promise<void> {
    logger.info({ tenantId, type: fact.type, userId: fact.userId }, 'Storing long-term memory');

    // TODO: persist fact to ai_memories table with high retention
  }

  async recall(
    tenantId: string,
    query: { userId?: string; type?: string; limit?: number }
  ): Promise<RecalledMemory[]> {
    logger.debug({ tenantId, query }, 'Recalling long-term memories');

    // TODO: query ai_memories table with relevance scoring
    return [];
  }

  async consolidate(tenantId: string): Promise<void> {
    logger.info({ tenantId }, 'Consolidating long-term memories');

    // TODO: merge duplicate/similar memories, prune low-confidence entries
  }
}
