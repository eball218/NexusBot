import pino from 'pino';

const logger = pino({ name: 'job-runner' });

export interface JobRunParams {
  tenantId: string;
  jobId: string;
  jobName: string;
  actionType: string;
  actionParams: Record<string, unknown>;
  discordClient?: { sendMessage(ch: string, msg: string): Promise<void> };
  twitchClient?: { sendMessage(ch: string, msg: string): Promise<void> };
}

export interface JobRunResult {
  success: boolean;
  result?: string;
  error?: string;
}

export class JobRunner {
  async run(params: JobRunParams): Promise<JobRunResult> {
    const { tenantId, jobId, jobName, actionType, actionParams } = params;

    logger.info({ tenantId, jobId, jobName, actionType }, 'Running job action');

    try {
      switch (actionType) {
        case 'send_message':
          return await this.handleSendMessage(params);

        case 'post_announcement':
          return await this.handlePostAnnouncement(params);

        case 'custom':
          return await this.handleCustomAction(params);

        default:
          return {
            success: false,
            error: `Unknown action type: ${actionType}`,
          };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({ tenantId, jobId, error: message }, 'Job action failed');
      return { success: false, error: message };
    }
  }

  private async handleSendMessage(params: JobRunParams): Promise<JobRunResult> {
    const { actionParams, discordClient, twitchClient } = params;
    const platform = actionParams.platform as string | undefined;
    const channel = actionParams.channel as string | undefined;
    const message = actionParams.message as string | undefined;

    if (!channel || !message) {
      return { success: false, error: 'Missing channel or message in actionParams' };
    }

    if (platform === 'discord' && discordClient) {
      await discordClient.sendMessage(channel, message);
      return { success: true, result: `Sent message to Discord channel ${channel}` };
    }

    if (platform === 'twitch' && twitchClient) {
      await twitchClient.sendMessage(channel, message);
      return { success: true, result: `Sent message to Twitch channel ${channel}` };
    }

    return {
      success: false,
      error: `No client available for platform: ${platform ?? 'unknown'}`,
    };
  }

  private async handlePostAnnouncement(params: JobRunParams): Promise<JobRunResult> {
    const { actionParams, discordClient, twitchClient } = params;
    const platform = actionParams.platform as string | undefined;
    const channel = actionParams.channel as string | undefined;
    const message = actionParams.message as string | undefined;

    if (!channel || !message) {
      return { success: false, error: 'Missing channel or message in actionParams' };
    }

    const formattedMessage = `[Announcement] ${message}`;

    if (platform === 'discord' && discordClient) {
      await discordClient.sendMessage(channel, formattedMessage);
      return { success: true, result: `Posted announcement to Discord channel ${channel}` };
    }

    if (platform === 'twitch' && twitchClient) {
      await twitchClient.sendMessage(channel, formattedMessage);
      return { success: true, result: `Posted announcement to Twitch channel ${channel}` };
    }

    return {
      success: false,
      error: `No client available for platform: ${platform ?? 'unknown'}`,
    };
  }

  private async handleCustomAction(params: JobRunParams): Promise<JobRunResult> {
    logger.info(
      { tenantId: params.tenantId, jobId: params.jobId, actionParams: params.actionParams },
      'Executing custom action'
    );

    // TODO: implement custom action execution pipeline
    return { success: true, result: 'Custom action executed (no-op)' };
  }
}
