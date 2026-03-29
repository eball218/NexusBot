import { eq, and, lte, isNull } from 'drizzle-orm';
import { tenants, users } from '@nexusbot/db';
import { getDb } from '../db';
import { EmailService } from './email.service';

const TRIAL_DAYS = 14;
const GRACE_PERIOD_DAYS = 3;

export class TrialService {
  private db = getDb();
  private email = new EmailService();

  async startTrial(tenantId: string): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    await this.db
      .update(tenants)
      .set({
        status: 'trial',
        trialStartedAt: now,
        trialExpiresAt: expiresAt,
        updatedAt: now,
      })
      .where(eq(tenants.id, tenantId));

    // Send trial started email
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });
    if (tenant) {
      const user = await this.db.query.users.findFirst({
        where: eq(users.id, tenant.userId),
      });
      if (user) {
        await this.email.sendTrialStarted(user.email, user.displayName).catch(() => {});
      }
    }
  }

  async checkExpiringTrials(): Promise<void> {
    const now = new Date();

    // Day 10 reminders (4 days left)
    const day10 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const day10Start = new Date(day10.getTime() - 60 * 60 * 1000); // 1-hour window

    const expiringDay10 = await this.db.query.tenants.findMany({
      where: and(
        eq(tenants.status, 'trial'),
        lte(tenants.trialExpiresAt, day10),
      ),
    });

    for (const tenant of expiringDay10) {
      if (!tenant.trialExpiresAt) continue;
      const daysLeft = Math.ceil(
        (tenant.trialExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
      );
      if (daysLeft === 4 || daysLeft === 1) {
        const user = await this.db.query.users.findFirst({
          where: eq(users.id, tenant.userId),
        });
        if (user) {
          await this.email.sendTrialExpiringSoon(user.email, user.displayName, daysLeft).catch(() => {});
        }
      }
    }

    // Expire trials that are past due
    const expired = await this.db.query.tenants.findMany({
      where: and(
        eq(tenants.status, 'trial'),
        lte(tenants.trialExpiresAt, now),
      ),
    });

    for (const tenant of expired) {
      await this.db
        .update(tenants)
        .set({ status: 'cancelled', tier: 'free', updatedAt: now })
        .where(eq(tenants.id, tenant.id));

      const user = await this.db.query.users.findFirst({
        where: eq(users.id, tenant.userId),
      });
      if (user) {
        await this.email.sendTrialExpired(user.email, user.displayName).catch(() => {});
      }
    }
  }

  async getTrialStatus(tenantId: string) {
    const tenant = await this.db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant || tenant.status !== 'trial') {
      return { isTrialing: false, daysLeft: 0, expiresAt: null };
    }

    const now = new Date();
    const daysLeft = tenant.trialExpiresAt
      ? Math.max(0, Math.ceil((tenant.trialExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      : 0;

    return {
      isTrialing: true,
      daysLeft,
      expiresAt: tenant.trialExpiresAt,
      startedAt: tenant.trialStartedAt,
    };
  }
}
