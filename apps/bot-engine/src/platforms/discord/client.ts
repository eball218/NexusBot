import { Client, GatewayIntentBits, Events } from 'discord.js';
import pino from 'pino';

interface DiscordBotClientOptions {
  guildId: string;
  botToken: string;
  tenantId: string;
}

interface IncomingMessage {
  content: string;
  author: { id: string; username: string; bot: boolean };
  channelId: string;
}

export class DiscordBotClient {
  private client: Client | null = null;
  private readonly guildId: string;
  private readonly botToken: string;
  private readonly tenantId: string;
  private readonly logger: pino.Logger;

  onMessage: ((message: IncomingMessage) => void) | null = null;

  constructor({ guildId, botToken, tenantId }: DiscordBotClientOptions) {
    this.guildId = guildId;
    this.botToken = botToken;
    this.tenantId = tenantId;
    this.logger = pino({ name: 'discord-bot-client' }).child({
      tenantId,
      platform: 'discord',
    });
  }

  async connect(): Promise<void> {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.on(Events.ClientReady, (readyClient) => {
      this.logger.info(
        { guildId: this.guildId, username: readyClient.user.tag },
        'Discord bot connected and ready'
      );
    });

    this.client.on(Events.MessageCreate, (message) => {
      if (message.author.bot) return;

      if (this.onMessage) {
        this.onMessage({
          content: message.content,
          author: {
            id: message.author.id,
            username: message.author.username,
            bot: message.author.bot,
          },
          channelId: message.channelId,
        });
      }
    });

    await this.client.login(this.botToken);
    this.logger.info('Discord bot login initiated');
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.destroy();
      this.client = null;
      this.logger.info('Discord bot disconnected');
    }
  }

  async sendMessage(channelId: string, content: string): Promise<void> {
    if (!this.client) {
      throw new Error('Discord client is not connected');
    }

    const channel = await this.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel ${channelId} not found or is not a text channel`);
    }

    if ('send' in channel) {
      await channel.send(content);
      this.logger.debug({ channelId }, 'Message sent to Discord channel');
    }
  }
}
