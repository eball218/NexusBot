/**
 * Standalone bot runner - connects to Discord and Twitch
 * Reads configuration from the database and logs actions back.
 * Run with: tsx apps/bot-engine/src/standalone-bot.ts
 */
import 'dotenv/config';
import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { eq, and } from 'drizzle-orm';
import {
  createDb,
  type Database,
  tenants,
  modRules,
  modActions,
  communityUsers,
  botCommands,
  aiPersonalities,
  aiConversations,
  aiMessages,
} from '@nexusbot/db';
import { ChatEngine, type ChatEngineConfig } from './ai/chat-engine';

// ---------------------------------------------------------------------------
// Simple logger (no pino-pretty dependency)
// ---------------------------------------------------------------------------
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const LEVELS: Record<string, number> = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };
const currentLevel = LEVELS[LOG_LEVEL] ?? 20;
const logger = {
  debug: (obj: unknown, msg?: string) => {
    if (currentLevel <= 10) console.log(`[DEBUG] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj));
  },
  info: (obj: unknown, msg?: string) => {
    if (currentLevel <= 20) console.log(`[INFO] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj));
  },
  warn: (obj: unknown, msg?: string) => {
    if (currentLevel <= 30) console.warn(`[WARN] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj));
  },
  error: (obj: unknown, msg?: string) => {
    if (currentLevel <= 40) console.error(`[ERROR] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj));
  },
  fatal: (obj: unknown, msg?: string) => {
    console.error(`[FATAL] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj));
  },
};

// ---------------------------------------------------------------------------
// Env config
// ---------------------------------------------------------------------------
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const TWITCH_ACCESS_TOKEN = process.env.TWITCH_BOT_ACCESS_TOKEN || '';
const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL || '';
const BOT_NAME = process.env.BOT_NAME || 'NexusBot';
const DATABASE_URL = process.env.DATABASE_URL || '';
const TENANT_ID = process.env.TENANT_ID || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DbModRule {
  id: string;
  ruleType: string;
  pattern: string | null;
  severity: number;
  action: string;
  platforms: string;
  enabled: boolean;
  sortOrder: number;
}

interface DbBotCommand {
  id: string;
  command: string;
  response: string;
  cooldownSeconds: number;
  platform: string;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------
let db: Database | null = null;
let resolvedTenantId: string | null = null;
const startTime = Date.now();

// Cached config from DB - refreshed every 60s
let cachedRules: DbModRule[] = [];
let cachedCommands: DbBotCommand[] = [];
let cachedPersonality: Record<string, unknown> = {};

// Command cooldowns: Map<"commandId:platform:channelOrUser", lastUsedTimestamp>
const commandCooldowns = new Map<string, number>();

// Chat engine for AI conversations (created lazily)
let chatEngine: ChatEngine | null = null;

// ---------------------------------------------------------------------------
// Database initialisation
// ---------------------------------------------------------------------------
async function initDatabase(): Promise<boolean> {
  if (!DATABASE_URL) {
    logger.warn('No DATABASE_URL set, running without database');
    return false;
  }

  try {
    db = createDb(DATABASE_URL);
    logger.info({ tag: 'db' }, 'Database connection established');
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ tag: 'db', error: message }, 'Failed to connect to database, falling back to hardcoded behaviour');
    db = null;
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tenant resolution
// ---------------------------------------------------------------------------
async function resolveTenant(): Promise<string | null> {
  if (!db) return null;

  try {
    if (TENANT_ID) {
      const [tenant] = await db.select().from(tenants).where(eq(tenants.id, TENANT_ID)).limit(1);
      if (tenant) {
        logger.info({ tag: 'tenant', tenantId: tenant.id, name: tenant.displayName }, 'Tenant resolved from TENANT_ID env');
        return tenant.id;
      }
      logger.warn({ tag: 'tenant', tenantId: TENANT_ID }, 'TENANT_ID not found, falling back to first active tenant');
    }

    // Fallback: first active tenant
    const [tenant] = await db.select().from(tenants).where(eq(tenants.status, 'active')).limit(1);
    if (tenant) {
      logger.info({ tag: 'tenant', tenantId: tenant.id, name: tenant.displayName }, 'Resolved first active tenant');
      return tenant.id;
    }

    logger.warn({ tag: 'tenant' }, 'No active tenants found in database');
    return null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ tag: 'tenant', error: message }, 'Failed to resolve tenant');
    return null;
  }
}

// ---------------------------------------------------------------------------
// Config loading from DB
// ---------------------------------------------------------------------------
async function loadConfigFromDb(): Promise<void> {
  if (!db || !resolvedTenantId) return;

  try {
    // Load mod rules
    const rules = await db
      .select()
      .from(modRules)
      .where(eq(modRules.tenantId, resolvedTenantId))
      .orderBy(modRules.sortOrder);

    cachedRules = rules.map((r) => ({
      id: r.id,
      ruleType: r.ruleType,
      pattern: r.pattern,
      severity: r.severity,
      action: r.action,
      platforms: r.platforms,
      enabled: r.enabled,
      sortOrder: r.sortOrder,
    }));

    // Load bot commands
    const commands = await db
      .select()
      .from(botCommands)
      .where(eq(botCommands.tenantId, resolvedTenantId))
      .orderBy(botCommands.sortOrder);

    cachedCommands = commands.map((c) => ({
      id: c.id,
      command: c.command,
      response: c.response,
      cooldownSeconds: c.cooldownSeconds,
      platform: c.platform,
      enabled: c.enabled,
    }));

    // Load AI personality
    const [personality] = await db
      .select()
      .from(aiPersonalities)
      .where(eq(aiPersonalities.tenantId, resolvedTenantId))
      .limit(1);

    cachedPersonality = (personality?.config as Record<string, unknown>) ?? {};

    // Rebuild chat engine if personality changed and API key is set
    if (ANTHROPIC_API_KEY) {
      chatEngine = new ChatEngine({
        personality: cachedPersonality,
        tenantId: resolvedTenantId,
        model: process.env.AI_MODEL || undefined,
        maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS, 10) : undefined,
      });
    }

    logger.info(
      { tag: 'config', rules: cachedRules.length, commands: cachedCommands.length, hasPersonality: !!personality },
      'Config loaded from database',
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ tag: 'config', error: message }, 'Failed to load config from database');
  }
}

// ---------------------------------------------------------------------------
// Database helpers: community user upsert
// ---------------------------------------------------------------------------
async function ensureCommunityUser(
  tenantId: string,
  platform: 'discord' | 'twitch',
  platformId: string,
  username: string,
): Promise<string | null> {
  if (!db) return null;

  try {
    // Try to find existing user
    const condition =
      platform === 'discord'
        ? and(eq(communityUsers.tenantId, tenantId), eq(communityUsers.discordId, platformId))
        : and(eq(communityUsers.tenantId, tenantId), eq(communityUsers.twitchId, platformId));

    const [existing] = await db.select().from(communityUsers).where(condition).limit(1);

    if (existing) {
      // Update last seen
      await db
        .update(communityUsers)
        .set({ lastSeenAt: new Date() })
        .where(eq(communityUsers.id, existing.id));
      return existing.id;
    }

    // Insert new community user
    const insertData: Record<string, unknown> = {
      tenantId,
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
    };
    if (platform === 'discord') {
      insertData.discordId = platformId;
      insertData.discordUsername = username;
    } else {
      insertData.twitchId = platformId;
      insertData.twitchUsername = username;
    }

    const [newUser] = await db
      .insert(communityUsers)
      .values(insertData as typeof communityUsers.$inferInsert)
      .returning({ id: communityUsers.id });

    logger.info({ tag: 'db', platform, platformId, username }, 'New community user created');
    return newUser?.id ?? null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ tag: 'db', error: message }, 'Failed to upsert community user');
    return null;
  }
}

// ---------------------------------------------------------------------------
// Database helpers: log mod action
// ---------------------------------------------------------------------------
async function logModAction(
  tenantId: string,
  communityUserId: string,
  platform: string,
  actionType: string,
  reason: string,
  ruleId: string | null,
  originalMessage: string,
): Promise<void> {
  if (!db) return;

  try {
    await db.insert(modActions).values({
      tenantId,
      communityUserId,
      platform,
      actionType,
      reason,
      performedBy: 'bot',
      ruleId: ruleId ?? undefined,
      originalMessage,
    });
    logger.debug({ tag: 'db', actionType, platform }, 'Mod action logged');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ tag: 'db', error: message }, 'Failed to log mod action');
  }
}

// ---------------------------------------------------------------------------
// Database helpers: log AI conversation
// ---------------------------------------------------------------------------
async function logAiConversation(
  tenantId: string,
  communityUserId: string | null,
  platform: string,
  channel: string,
  userMessage: string,
  assistantResponse: string,
): Promise<void> {
  if (!db) return;

  try {
    // Create or find active conversation
    const [conversation] = await db
      .insert(aiConversations)
      .values({
        tenantId,
        communityUserId: communityUserId ?? undefined,
        platform,
        channel,
        messageCount: 2,
        lastMessageAt: new Date(),
      })
      .returning({ id: aiConversations.id });

    if (!conversation) return;

    // Insert both messages
    await db.insert(aiMessages).values([
      {
        conversationId: conversation.id,
        role: 'user' as const,
        content: userMessage,
        platform,
      },
      {
        conversationId: conversation.id,
        role: 'assistant' as const,
        content: assistantResponse,
        platform,
      },
    ]);

    logger.debug({ tag: 'db', conversationId: conversation.id }, 'AI conversation logged');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ tag: 'db', error: message }, 'Failed to log AI conversation');
  }
}

// ---------------------------------------------------------------------------
// Moderation: check message against DB rules
// ---------------------------------------------------------------------------
function checkModeration(content: string, platform: 'discord' | 'twitch'): { triggered: boolean; rule?: DbModRule; reason?: string } {
  const enabledRules = cachedRules
    .filter((r) => r.enabled && (r.platforms === 'both' || r.platforms === platform))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (const rule of enabledRules) {
    let triggered = false;
    let reason = '';

    switch (rule.ruleType) {
      case 'spam': {
        // Repeated characters (5+)
        if (/(.)\1{4,}/.test(content)) {
          triggered = true;
          reason = 'Message flagged as spam (repeated characters)';
        }
        // All caps (>70% of message over 10 chars)
        if (!triggered && content.length > 10) {
          const upperCount = content.replace(/[^A-Z]/g, '').length;
          if (upperCount / content.length > 0.7) {
            triggered = true;
            reason = 'Message flagged as spam (excessive caps)';
          }
        }
        break;
      }
      case 'links': {
        const urlPattern = rule.pattern ? new RegExp(rule.pattern, 'i') : /https?:\/\/\S+/i;
        if (urlPattern.test(content)) {
          triggered = true;
          reason = 'Message contains blocked link';
        }
        break;
      }
      case 'caps_emotes': {
        if (content.length > 10) {
          const upperCount = content.replace(/[^A-Z]/g, '').length;
          if (upperCount / content.length > 0.7) {
            triggered = true;
            reason = 'Message has excessive caps';
          }
        }
        break;
      }
      case 'custom_words': {
        if (rule.pattern) {
          try {
            const regex = new RegExp(rule.pattern, 'i');
            if (regex.test(content)) {
              triggered = true;
              reason = 'Message matched custom word filter';
            }
          } catch {
            // If the pattern stored in DB is not valid regex, try plain includes
            const words = rule.pattern.split(',').map((w) => w.trim().toLowerCase());
            const lower = content.toLowerCase();
            if (words.some((w) => lower.includes(w))) {
              triggered = true;
              reason = 'Message matched custom word filter';
            }
          }
        }
        break;
      }
      default: {
        // Unknown rule type - skip
        continue;
      }
    }

    if (triggered) {
      return { triggered: true, rule, reason };
    }
  }

  return { triggered: false };
}

// ---------------------------------------------------------------------------
// Fallback moderation when DB is unavailable
// ---------------------------------------------------------------------------
function checkFallbackModeration(content: string): boolean {
  // Repeated characters (5+)
  if (/(.)\1{4,}/.test(content)) return true;
  // All caps (>70% of message over 10 chars)
  if (content.length > 10) {
    const upperCount = content.replace(/[^A-Z]/g, '').length;
    if (upperCount / content.length > 0.7) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Template variable replacement for command responses
// ---------------------------------------------------------------------------
function resolveTemplateVars(template: string, authorName: string, channelName: string): string {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const uptimeStr = `${hours}h ${mins}m`;

  return template
    .replace(/\{\{user\}\}/g, authorName)
    .replace(/\{\{channel\}\}/g, channelName)
    .replace(/\{\{uptime\}\}/g, uptimeStr);
}

// ---------------------------------------------------------------------------
// Command matching with cooldown
// ---------------------------------------------------------------------------
function matchCommand(
  content: string,
  platform: 'discord' | 'twitch',
  channelId: string,
  authorName: string,
  channelName: string,
): string | null {
  const lower = content.toLowerCase().trim();

  for (const cmd of cachedCommands) {
    if (!cmd.enabled) continue;
    // Accept 'both', 'all', or 'All' as "any platform"
    const plat = cmd.platform.toLowerCase();
    if (plat !== 'both' && plat !== 'all' && plat !== platform) continue;

    // Match command (with or without ! prefix)
    const trigger = cmd.command.startsWith('!') ? cmd.command.toLowerCase() : `!${cmd.command.toLowerCase()}`;
    // Strip Discord mentions from beginning of message for matching
    const stripped = lower.replace(/^<@!?\d+>\s*/g, '').trim();
    if (stripped !== trigger && stripped !== cmd.command.toLowerCase() && lower !== trigger && lower !== cmd.command.toLowerCase()) continue;

    // Check cooldown
    const cooldownKey = `${cmd.id}:${platform}:${channelId}`;
    const lastUsed = commandCooldowns.get(cooldownKey) ?? 0;
    const now = Date.now();
    if (now - lastUsed < cmd.cooldownSeconds * 1000) {
      // Still on cooldown, silently ignore
      return null;
    }

    commandCooldowns.set(cooldownKey, now);
    return resolveTemplateVars(cmd.response, authorName, channelName);
  }

  return null;
}

// ---------------------------------------------------------------------------
// Fallback bot responses (used when no DB)
// ---------------------------------------------------------------------------
function getFallbackResponse(message: string, authorName: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes('nexusbot') || lower.includes('!hello') || lower.includes('!bot')) {
    const greetings = [
      `Hey ${authorName}! I'm ${BOT_NAME}, your AI-powered community assistant!`,
      `What's up ${authorName}! I'm here and ready to help!`,
      `Hello ${authorName}! Need anything? I'm always watching over the chat!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (lower === '!help') {
    return `Available commands: !hello, !help, !stats, !uptime | I also moderate chat automatically!`;
  }

  if (lower === '!stats') {
    return `Session stats: I've been watching the chat and keeping things clean!`;
  }

  if (lower === '!uptime') {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    return `I've been online for ${hours}h ${mins}m`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// AI response handling
// ---------------------------------------------------------------------------
async function getAiResponse(
  content: string,
  authorId: string,
  authorName: string,
  platform: 'discord' | 'twitch',
  channel: string,
  communityUserId: string | null,
): Promise<string | null> {
  if (!chatEngine || !ANTHROPIC_API_KEY) return null;

  try {
    const response = await chatEngine.respond({
      content,
      authorId,
      authorName,
      platform,
      channel,
    });

    // Log the conversation to DB
    if (resolvedTenantId) {
      await logAiConversation(resolvedTenantId, communityUserId, platform, channel, content, response);
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ tag: 'ai', error: message }, 'AI response failed');
    return null;
  }
}

// ---------------------------------------------------------------------------
// Message pipeline: moderation -> commands -> AI
// ---------------------------------------------------------------------------
async function handleMessage(
  content: string,
  authorId: string,
  authorName: string,
  platform: 'discord' | 'twitch',
  channelId: string,
  channelName: string,
  replyFn: (text: string) => Promise<void>,
  isMention: boolean,
): Promise<void> {
  logger.info(
    { tag: 'pipeline', db: !!db, tenant: resolvedTenantId, rulesCount: cachedRules.length, cmdsCount: cachedCommands.length, content, platform },
    'Pipeline start',
  );

  // 1. Find/create community user
  let communityUserId: string | null = null;
  if (db && resolvedTenantId) {
    communityUserId = await ensureCommunityUser(resolvedTenantId, platform, authorId, authorName);
  }

  // 2. Check moderation rules
  if (db && resolvedTenantId && cachedRules.length > 0) {
    const modResult = checkModeration(content, platform);
    if (modResult.triggered && modResult.rule) {
      const action = modResult.rule.action || 'warn';
      const reason = modResult.reason || 'Moderation rule triggered';

      // Log to DB
      if (communityUserId) {
        await logModAction(resolvedTenantId, communityUserId, platform, action, reason, modResult.rule.id, content);
      }

      // Respond based on action type
      if (action === 'warn') {
        await replyFn(`@${authorName}, ${reason}. This is an automated warning.`);
      } else if (action === 'timeout') {
        await replyFn(`@${authorName}, you have been timed out. Reason: ${reason}`);
      } else if (action === 'ban') {
        await replyFn(`@${authorName} has been banned. Reason: ${reason}`);
      }

      logger.info({ tag: 'moderation', platform, author: authorName, action, reason }, 'Mod rule triggered');
      return;
    }
  } else {
    // Fallback moderation when DB is not available
    if (checkFallbackModeration(content)) {
      await replyFn(`@${authorName}, please avoid spamming. This is an automated warning.`);
      logger.info({ tag: 'moderation', platform, author: authorName }, 'Fallback spam detected');
      return;
    }
  }

  // 3. Check custom commands from DB
  if (cachedCommands.length > 0) {
    const cmdResponse = matchCommand(content, platform, channelId, authorName, channelName);
    if (cmdResponse) {
      await replyFn(cmdResponse);
      logger.info({ tag: 'command', platform, author: authorName, content }, 'Command matched');
      return;
    }
  }

  // 4. AI conversation (if mentioned or direct message, and ANTHROPIC_API_KEY is set)
  if (ANTHROPIC_API_KEY && isMention) {
    const aiResponse = await getAiResponse(content, authorId, authorName, platform, channelId, communityUserId);
    if (aiResponse) {
      await replyFn(aiResponse);
      logger.info({ tag: 'ai', platform, author: authorName }, 'AI responded');
      return;
    }
  }

  // 5. Built-in fallback responses (always available as a safety net)
  const fallback = getFallbackResponse(content, authorName);
  if (fallback) {
    await replyFn(fallback);
    logger.info({ tag: 'fallback', platform, author: authorName }, 'Fallback response');
  }
}

// ===== DISCORD =====
async function startDiscord() {
  if (!DISCORD_BOT_TOKEN) {
    logger.warn('No DISCORD_BOT_TOKEN set, skipping Discord');
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
  });

  // Debug: log ALL events
  client.on(Events.Debug, (info) => {
    if (info.includes('Heartbeat')) return;
    logger.debug({ tag: 'discord-debug' }, info);
  });

  client.on(Events.Warn, (info) => {
    logger.warn({ tag: 'discord-warn' }, info);
  });

  client.on(Events.Error, (err) => {
    logger.error({ tag: 'discord-error', error: err.message }, 'Discord client error');
  });

  client.on(Events.ClientReady, (c) => {
    logger.info({ tag: 'discord', user: c.user.tag, guilds: c.guilds.cache.size }, 'Discord bot connected!');
    c.guilds.cache.forEach((guild) => {
      logger.info({ tag: 'discord', guildId: guild.id, guildName: guild.name, memberCount: guild.memberCount }, 'Connected to guild');
      const textChannels = guild.channels.cache.filter((ch) => ch.type === 0);
      textChannels.forEach((ch) => {
        logger.info({ tag: 'discord', channelId: ch.id, channelName: ch.name }, 'Text channel found');
      });
    });
  });

  client.on(Events.MessageCreate, async (message) => {
    logger.info(
      { tag: 'discord-msg', author: message.author?.tag, bot: message.author?.bot, content: message.content, guildId: message.guild?.id, channelId: message.channel?.id },
      'RAW MessageCreate event',
    );

    // Ignore bots and DMs
    if (message.author.bot) return;
    if (!message.guild) return;
    if (DISCORD_GUILD_ID && message.guild.id !== DISCORD_GUILD_ID) return;

    const content = message.content;
    const authorName = message.member?.displayName || message.author.username;
    const authorId = message.author.id;
    const channelId = message.channel.id;
    const channelName = 'name' in message.channel ? (message.channel.name ?? channelId) : channelId;

    // Check if the bot is mentioned
    const isMention = message.mentions.users.has(client.user?.id ?? '') || content.toLowerCase().includes(BOT_NAME.toLowerCase());

    logger.info({ tag: 'discord', author: authorName, content }, 'Message received from user');

    try {
      await handleMessage(content, authorId, authorName, 'discord', channelId, channelName, async (text) => {
        await message.reply(text);
      }, isMention);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.stack || err.message : String(err);
      logger.error({ tag: 'discord', error: errMsg }, 'handleMessage threw an exception');
    }
  });

  await client.login(DISCORD_BOT_TOKEN);
}

// ===== TWITCH =====
async function startTwitch() {
  if (!TWITCH_CHANNEL) {
    logger.warn('No TWITCH_CHANNEL set, skipping Twitch');
    return;
  }

  if (!TWITCH_ACCESS_TOKEN) {
    logger.warn('No TWITCH_BOT_ACCESS_TOKEN set, skipping Twitch');
    return;
  }

  const authProvider = new StaticAuthProvider(TWITCH_CLIENT_ID, TWITCH_ACCESS_TOKEN);
  const chatClient = new ChatClient({ authProvider, channels: [TWITCH_CHANNEL] });

  chatClient.onConnect(() => {
    logger.info({ tag: 'twitch', channel: TWITCH_CHANNEL }, 'Twitch bot connected!');
  });

  chatClient.onMessage(async (channel: string, user: string, text: string, msgInfo) => {
    logger.debug({ tag: 'twitch', user, text, channel }, 'Message received');

    const userId = msgInfo?.userInfo?.userId ?? user;
    const channelName = channel.replace('#', '');

    // Check if the bot is mentioned
    const isMention = text.toLowerCase().includes(BOT_NAME.toLowerCase());

    try {
      await handleMessage(text, userId, user, 'twitch', channelName, channelName, async (reply) => {
        chatClient.say(channel, reply);
      }, isMention);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.stack || err.message : String(err);
      logger.error({ tag: 'twitch', error: errMsg }, 'handleMessage threw an exception');
    }
  });

  await chatClient.connect();
}

// ---------------------------------------------------------------------------
// Config refresh interval
// ---------------------------------------------------------------------------
function startConfigRefresh() {
  if (!db || !resolvedTenantId) return;

  setInterval(async () => {
    logger.debug({ tag: 'config' }, 'Refreshing config from database...');
    await loadConfigFromDb();
  }, 60_000);
}

// ===== MAIN =====
async function main() {
  logger.info('========================================');
  logger.info(`  ${BOT_NAME} Engine Starting...`);
  logger.info('========================================');

  // 1. Initialise database connection
  const dbReady = await initDatabase();

  if (dbReady) {
    // 2. Resolve tenant
    resolvedTenantId = await resolveTenant();

    if (resolvedTenantId) {
      // 3. Load config from DB
      await loadConfigFromDb();

      // 4. Start config refresh every 60s
      startConfigRefresh();
    } else {
      logger.warn('No tenant resolved, running with fallback behaviour');
    }
  } else {
    logger.warn('Database not available, running with hardcoded fallback behaviour');
  }

  // 5. Start platform connections
  const results = await Promise.allSettled([startDiscord(), startTwitch()]);

  results.forEach((result, i) => {
    const platform = i === 0 ? 'Discord' : 'Twitch';
    if (result.status === 'fulfilled') {
      logger.info({ platform }, `${platform} started successfully`);
    } else {
      logger.error({ platform, error: result.reason?.message }, `${platform} failed to start`);
    }
  });

  logger.info('Bot engine running. Press Ctrl+C to stop.');
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  process.exit(0);
});
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  process.exit(0);
});

main().catch((err) => {
  logger.fatal(err, 'Bot engine crashed');
  process.exit(1);
});
