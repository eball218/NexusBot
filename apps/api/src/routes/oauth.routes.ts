import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config';
import { AuthService } from '../services/auth.service';
import { validate } from '../utils/validation';
import { BadRequestError } from '../utils/errors';

const oauthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().optional(),
});

export async function oauthRoutes(app: FastifyInstance) {
  const authService = new AuthService();

  // POST /api/v1/auth/oauth/discord
  app.post('/oauth/discord', async (request, reply) => {
    const { code } = validate(oauthCallbackSchema, request.body);

    // Exchange code for tokens
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.oauth.discord.clientId,
        client_secret: config.oauth.discord.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.oauth.discord.redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      throw new BadRequestError('Failed to exchange Discord authorization code');
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      token_type: string;
    };

    // Fetch user info
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new BadRequestError('Failed to fetch Discord user info');
    }

    const discordUser = (await userRes.json()) as {
      id: string;
      username: string;
      email: string;
      avatar: string | null;
    };

    if (!discordUser.email) {
      throw new BadRequestError('Discord account must have an email address');
    }

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    const tokens = await authService.findOrCreateOAuthUser(
      'discord',
      discordUser.id,
      discordUser.username,
      discordUser.email,
      tokenData.access_token,
      tokenData.refresh_token,
      avatarUrl ?? undefined,
    );

    reply.send({ data: tokens });
  });

  // POST /api/v1/auth/oauth/twitch
  app.post('/oauth/twitch', async (request, reply) => {
    const { code } = validate(oauthCallbackSchema, request.body);

    // Exchange code for tokens
    const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.oauth.twitch.clientId,
        client_secret: config.oauth.twitch.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.oauth.twitch.redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      throw new BadRequestError('Failed to exchange Twitch authorization code');
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      token_type: string;
    };

    // Fetch user info
    const userRes = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Client-Id': config.oauth.twitch.clientId,
      },
    });

    if (!userRes.ok) {
      throw new BadRequestError('Failed to fetch Twitch user info');
    }

    const twitchData = (await userRes.json()) as {
      data: Array<{
        id: string;
        login: string;
        display_name: string;
        email: string;
        profile_image_url: string;
      }>;
    };

    const twitchUser = twitchData.data[0];
    if (!twitchUser?.email) {
      throw new BadRequestError('Twitch account must have an email address');
    }

    const tokens = await authService.findOrCreateOAuthUser(
      'twitch',
      twitchUser.id,
      twitchUser.display_name,
      twitchUser.email,
      tokenData.access_token,
      tokenData.refresh_token,
      twitchUser.profile_image_url,
    );

    reply.send({ data: tokens });
  });
}
