import pino from 'pino';

interface ModAction {
  type: string;
  userId: string;
  platform: string;
  reason: string;
  duration?: number;
}

interface PlatformClient {
  sendMessage(ch: string, msg: string): Promise<void>;
}

const logger = pino({ name: 'mod-action-executor' });

export class ModActionExecutor {
  async execute(
    action: ModAction,
    discordClient?: PlatformClient,
    twitchClient?: PlatformClient
  ): Promise<void> {
    const client = action.platform === 'discord' ? discordClient : twitchClient;

    logger.info(
      { type: action.type, userId: action.userId, platform: action.platform },
      `Executing moderation action: ${action.type}`
    );

    switch (action.type) {
      case 'warn': {
        if (client) {
          // TODO: Send warning as DM or channel message depending on platform config
          logger.info({ userId: action.userId }, `Warning user: ${action.reason}`);
        }
        break;
      }
      case 'timeout': {
        // TODO: Call platform API to timeout user
        // Discord: member.timeout(duration)
        // Twitch: /timeout username duration
        logger.info(
          { userId: action.userId, duration: action.duration },
          `Timeout user: ${action.reason}`
        );
        break;
      }
      case 'ban': {
        // TODO: Call platform API to ban user
        // Discord: member.ban({ reason })
        // Twitch: /ban username
        logger.info({ userId: action.userId }, `Ban user: ${action.reason}`);
        break;
      }
      default: {
        logger.warn({ type: action.type }, 'Unknown moderation action type');
      }
    }
  }
}
