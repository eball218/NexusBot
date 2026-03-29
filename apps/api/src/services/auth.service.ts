import { eq, and } from 'drizzle-orm';
import {
  users,
  sessions,
  emailVerifications,
  passwordResets,
  tenants,
  oauthAccounts,
} from '@nexusbot/db';
import { getDb } from '../db';
import { hashPassword, verifyPassword, hashToken, generateToken } from '../utils/hash';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type AccessTokenPayload,
} from '../utils/jwt';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../utils/errors';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  private db = getDb();

  async register(input: RegisterInput): Promise<{ userId: string; verificationToken: string }> {
    // Check if email already exists
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(input.password);

    // Create user
    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        role: 'user',
      })
      .returning({ id: users.id });

    // Create tenant record
    await this.db.insert(tenants).values({
      userId: user.id,
      displayName: input.displayName,
      tier: 'free',
      status: 'trial',
    });

    // Create email verification token
    const token = generateToken();
    await this.db.insert(emailVerifications).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    return { userId: user.id, verificationToken: token };
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.isSuspended) {
      throw new UnauthorizedError('Account suspended');
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return this.createSession(user.id, user.email, user.role, input.ipAddress, input.userAgent);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);

    const verification = await this.db.query.emailVerifications.findFirst({
      where: eq(emailVerifications.tokenHash, tokenHash),
    });

    if (!verification) {
      throw new BadRequestError('Invalid verification token');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestError('Verification token expired');
    }

    await this.db
      .update(users)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, verification.userId));

    // Clean up used token
    await this.db
      .delete(emailVerifications)
      .where(eq(emailVerifications.id, verification.id));
  }

  async forgotPassword(email: string): Promise<string | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Don't reveal whether email exists
    if (!user) return null;

    const token = generateToken();
    await this.db.insert(passwordResets).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);

    const reset = await this.db.query.passwordResets.findFirst({
      where: and(
        eq(passwordResets.tokenHash, tokenHash),
        eq(passwordResets.used, false),
      ),
    });

    if (!reset) {
      throw new BadRequestError('Invalid reset token');
    }

    if (reset.expiresAt < new Date()) {
      throw new BadRequestError('Reset token expired');
    }

    const passwordHash = await hashPassword(newPassword);

    await this.db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, reset.userId));

    await this.db
      .update(passwordResets)
      .set({ used: true })
      .where(eq(passwordResets.id, reset.id));

    // Invalidate all existing sessions
    await this.db
      .delete(sessions)
      .where(eq(sessions.userId, reset.userId));
  }

  async refresh(refreshTokenStr: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenHash = hashToken(refreshTokenStr);
    const session = await this.db.query.sessions.findFirst({
      where: eq(sessions.refreshTokenHash, tokenHash),
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Session expired');
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, payload.sub),
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Rotate refresh token — delete old session
    await this.db.delete(sessions).where(eq(sessions.id, session.id));

    return this.createSession(user.id, user.email, user.role);
  }

  async logout(refreshTokenStr: string): Promise<void> {
    const tokenHash = hashToken(refreshTokenStr);
    await this.db
      .delete(sessions)
      .where(eq(sessions.refreshTokenHash, tokenHash));
  }

  async getProfile(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        emailVerified: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        timezone: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) throw new NotFoundError('User');

    const tenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.userId, userId),
    });

    return { ...user, tenant };
  }

  // --- OAuth ---

  async findOrCreateOAuthUser(
    provider: 'discord' | 'twitch',
    providerAccountId: string,
    providerUsername: string,
    email: string,
    accessToken: string,
    refreshToken: string | null,
    avatarUrl?: string,
  ): Promise<AuthTokens> {
    // Check for existing OAuth link
    const existing = await this.db.query.oauthAccounts.findFirst({
      where: and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, providerAccountId),
      ),
    });

    if (existing) {
      // Update tokens
      await this.db
        .update(oauthAccounts)
        .set({
          accessToken,
          refreshToken,
          providerUsername,
          updatedAt: new Date(),
        })
        .where(eq(oauthAccounts.id, existing.id));

      const user = await this.db.query.users.findFirst({
        where: eq(users.id, existing.userId),
      });
      if (!user) throw new NotFoundError('User');

      await this.db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      return this.createSession(user.id, user.email, user.role);
    }

    // Check if user with this email already exists
    let user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Create new user
      const [newUser] = await this.db
        .insert(users)
        .values({
          email,
          displayName: providerUsername,
          avatarUrl,
          emailVerified: true, // OAuth emails are pre-verified
          role: 'user',
        })
        .returning();
      user = newUser;

      // Create tenant
      await this.db.insert(tenants).values({
        userId: user.id,
        displayName: providerUsername,
        tier: 'free',
        status: 'trial',
      });
    }

    // Link OAuth account
    await this.db.insert(oauthAccounts).values({
      userId: user.id,
      provider,
      providerAccountId,
      providerUsername,
      accessToken,
      refreshToken,
    });

    return this.createSession(user.id, user.email, user.role);
  }

  // --- Private helpers ---

  private async createSession(
    userId: string,
    email: string,
    role: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    // Get tenant ID
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.userId, userId),
    });

    const accessPayload: AccessTokenPayload = {
      sub: userId,
      email,
      role,
      tenantId: tenant?.id,
    };

    const tokenId = generateToken().slice(0, 16);
    const refreshTokenStr = signRefreshToken({ sub: userId, jti: tokenId });
    const accessToken = signAccessToken(accessPayload);

    // Store session
    await this.db.insert(sessions).values({
      userId,
      refreshTokenHash: hashToken(refreshTokenStr),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress,
      userAgent,
    });

    return { accessToken, refreshToken: refreshTokenStr };
  }
}
