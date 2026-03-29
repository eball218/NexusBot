/**
 * Standalone bot runner - connects to Discord and Twitch
 * Run with: tsx apps/bot-engine/src/standalone-bot.ts
 */
import 'dotenv/config';
import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';

// Simple logger (no pino-pretty dependency)
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const LEVELS: Record<string, number> = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };
const currentLevel = LEVELS[LOG_LEVEL] ?? 20;
const logger = {
  debug: (obj: unknown, msg?: string) => { if (currentLevel <= 10) console.log(`[DEBUG] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj)); },
  info: (obj: unknown, msg?: string) => { if (currentLevel <= 20) console.log(`[INFO] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj)); },
  warn: (obj: unknown, msg?: string) => { if (currentLevel <= 30) console.warn(`[WARN] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj)); },
  error: (obj: unknown, msg?: string) => { if (currentLevel <= 40) console.error(`[ERROR] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj)); },
  fatal: (obj: unknown, msg?: string) => { console.error(`[FATAL] ${msg || ''}`, typeof obj === 'string' ? obj : JSON.stringify(obj)); },
};

// Config from env
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || '';
const TWITCH_ACCESS_TOKEN = process.env.TWITCH_BOT_ACCESS_TOKEN || '';
const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL || '';
const BOT_NAME = process.env.BOT_NAME || 'NexusBot';

// Simple moderation - check for spam patterns
function isSpam(content: string): boolean {
  // Repeated characters (5+)
  if (/(.)\1{4,}/.test(content)) return true;
  // All caps (>70% of message over 10 chars)
  if (content.length > 10) {
    const upperCount = content.replace(/[^A-Z]/g, '').length;
    if (upperCount / content.length > 0.7) return true;
  }
  return false;
}

// Simple bot responses
function getBotResponse(message: string, authorName: string): string | null {
  const lower = message.toLowerCase();

  // Direct mentions or commands
  if (lower.includes('nexusbot') || lower.includes('!hello') || lower.includes('!bot')) {
    const greetings = [
      `Hey ${authorName}! I'm ${BOT_NAME}, your AI-powered community assistant! 🤖`,
      `What's up ${authorName}! I'm here and ready to help! ✨`,
      `Hello ${authorName}! Need anything? I'm always watching over the chat! 👋`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (lower === '!help') {
    return `Available commands: !hello, !help, !stats, !uptime | I also moderate chat automatically! 🛡️`;
  }

  if (lower === '!stats') {
    return `📊 Session stats: I've been watching the chat and keeping things clean!`;
  }

  if (lower === '!uptime') {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    return `⏱️ I've been online for ${hours}h ${mins}m`;
  }

  return null;
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
    if (info.includes('Heartbeat')) return; // skip heartbeat spam
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
    // List all guilds and channels for verification
    c.guilds.cache.forEach((guild) => {
      logger.info({ tag: 'discord', guildId: guild.id, guildName: guild.name, memberCount: guild.memberCount }, 'Connected to guild');
      const textChannels = guild.channels.cache.filter((ch) => ch.type === 0); // 0 = GuildText
      textChannels.forEach((ch) => {
        logger.info({ tag: 'discord', channelId: ch.id, channelName: ch.name }, 'Text channel found');
      });
    });
  });

  client.on(Events.MessageCreate, async (message) => {
    // Log EVERY message first (including bot messages) for debugging
    logger.info({ tag: 'discord-msg', author: message.author?.tag, bot: message.author?.bot, content: message.content, guildId: message.guild?.id, channelId: message.channel?.id }, 'RAW MessageCreate event');

    // Ignore bots and DMs
    if (message.author.bot) return;
    if (!message.guild) return;
    if (DISCORD_GUILD_ID && message.guild.id !== DISCORD_GUILD_ID) return;

    const content = message.content;
    const authorName = message.member?.displayName || message.author.username;

    logger.info({ tag: 'discord', author: authorName, content }, 'Message received from user');

    // Moderation
    if (isSpam(content)) {
      logger.info({ tag: 'discord', author: authorName, content }, 'Spam detected, warning user');
      await message.reply(`⚠️ ${authorName}, please avoid spamming. This is an automated warning.`);
      return;
    }

    // Bot responses
    const response = getBotResponse(content, authorName);
    if (response) {
      await message.reply(response);
      logger.info({ tag: 'discord', author: authorName, response }, 'Bot responded');
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

  chatClient.onMessage(async (channel: string, user: string, text: string) => {
    logger.debug({ tag: 'twitch', user, text, channel }, 'Message received');

    // Moderation
    if (isSpam(text)) {
      logger.info({ tag: 'twitch', user, text }, 'Spam detected');
      chatClient.say(channel, `⚠️ @${user}, please avoid spamming.`);
      return;
    }

    // Bot responses
    const response = getBotResponse(text, user);
    if (response) {
      chatClient.say(channel, response);
      logger.info({ tag: 'twitch', user, response }, 'Bot responded');
    }
  });

  await chatClient.connect();
}

// ===== MAIN =====
async function main() {
  logger.info('========================================');
  logger.info(`  ${BOT_NAME} Engine Starting...`);
  logger.info('========================================');

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
