export const BOT_EVENTS = {
  // Lifecycle
  BOT_STARTED: 'bot:started',
  BOT_STOPPED: 'bot:stopped',
  BOT_ERROR: 'bot:error',
  BOT_HEARTBEAT: 'bot:heartbeat',
  BOT_CONFIG_UPDATED: 'bot:config_updated',

  // Moderation
  MOD_ACTION_TAKEN: 'mod:action_taken',
  MOD_APPEAL_RECEIVED: 'mod:appeal_received',
  MOD_APPEAL_RESOLVED: 'mod:appeal_resolved',

  // AI
  AI_CONVERSATION_STARTED: 'ai:conversation_started',
  AI_RESPONSE_SENT: 'ai:response_sent',
  AI_MEMORY_CREATED: 'ai:memory_created',
  AI_RATE_LIMITED: 'ai:rate_limited',

  // Cron
  CRON_JOB_EXECUTED: 'cron:job_executed',
  CRON_JOB_FAILED: 'cron:job_failed',

  // Platform
  PLATFORM_CONNECTED: 'platform:connected',
  PLATFORM_DISCONNECTED: 'platform:disconnected',
  PLATFORM_TOKEN_EXPIRED: 'platform:token_expired',
} as const;

export type BotEvent = (typeof BOT_EVENTS)[keyof typeof BOT_EVENTS];
