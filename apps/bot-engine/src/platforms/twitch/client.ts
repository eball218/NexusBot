import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import pino from 'pino';

interface TwitchBotClientOptions {
  channelId: string;
  accessToken: string;
  refreshToken: string;
  tenantId: string;
}

interface IncomingMessage {
  content: string;
  author: { id: string; username: string };
  channel: string;
}

export class TwitchBotClient {
  private chatClient: ChatClient | null = null;
  private readonly channelId: string;
  private readonly accessToken: string;
  private readonly refreshToken: string;
  private readonly tenantId: string;
  private readonly logger: pino.Logger;

  onMessage: ((message: IncomingMessage) => void) | null = null;

  constructor({ channelId, accessToken, refreshToken, tenantId }: TwitchBotClientOptions) {
    this.channelId = channelId;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tenantId = tenantId;
    this.logger = pino({ name: 'twitch-bot-client' }).child({
      tenantId,
      platform: 'twitch',
    });
  }

  async connect(): Promise<void> {
    const authProvider = new StaticAuthProvider(this.channelId, this.accessToken);

    this.chatClient = new ChatClient({ authProvider, channels: [this.channelId] });

    this.chatClient.onMessage((channel, user, text, msg) => {
      if (this.onMessage) {
        this.onMessage({
          content: text,
          author: {
            id: msg.userInfo.userId,
            username: user,
          },
          channel,
        });
      }
    });

    await this.chatClient.connect();
    this.logger.info({ channelId: this.channelId }, 'Twitch bot connected');
  }

  async disconnect(): Promise<void> {
    if (this.chatClient) {
      this.chatClient.quit();
      this.chatClient = null;
      this.logger.info('Twitch bot disconnected');
    }
  }

  async sendMessage(channel: string, content: string): Promise<void> {
    if (!this.chatClient) {
      throw new Error('Twitch chat client is not connected');
    }

    await this.chatClient.say(channel, content);
    this.logger.debug({ channel }, 'Message sent to Twitch channel');
  }
}
