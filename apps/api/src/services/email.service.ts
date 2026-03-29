import { Resend } from 'resend';
import { config } from '../config';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!config.email.resendApiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(config.email.resendApiKey);
  }
  return resendClient;
}

export class EmailService {
  private from = config.email.from;

  private async send(params: { to: string; subject: string; html: string }) {
    const resend = getResend();
    if (!resend) {
      console.log(`[EMAIL STUB] To: ${params.to} | Subject: ${params.subject}`);
      return;
    }
    await resend.emails.send({ from: this.from, ...params });
  }

  async sendWelcome(email: string, name: string) {
    await this.send({ to: email, subject: 'Welcome to NexusBot!', html: `<h1>Welcome, ${name}!</h1><p>Get started in your <a href="${config.app.dashboardUrl}">dashboard</a>.</p>` });
  }

  async sendEmailVerification(email: string, name: string, token: string) {
    const url = `${config.app.webUrl}/verify-email?token=${token}`;
    await this.send({ to: email, subject: 'Verify your NexusBot email', html: `<h1>Verify your email, ${name}</h1><p><a href="${url}">Click here to verify</a></p><p>Expires in 24 hours.</p>` });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `${config.app.webUrl}/reset-password?token=${token}`;
    await this.send({ to: email, subject: 'Reset your NexusBot password', html: `<h1>Reset Your Password</h1><p><a href="${url}">Click here to reset</a></p><p>Expires in 1 hour.</p>` });
  }

  async sendTrialStarted(email: string, name: string) {
    await this.send({ to: email, subject: 'Your 14-day NexusBot trial has started!', html: `<h1>Your trial is live, ${name}!</h1><p>Explore all the features in your <a href="${config.app.dashboardUrl}">dashboard</a>.</p>` });
  }

  async sendTrialExpiringSoon(email: string, name: string, daysLeft: number) {
    await this.send({ to: email, subject: `Trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`, html: `<h1>Don't lose your bot, ${name}!</h1><p>Your free trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. <a href="${config.app.dashboardUrl}/billing/upgrade">Upgrade now</a>.</p>` });
  }

  async sendTrialExpired(email: string, name: string) {
    await this.send({ to: email, subject: 'Your NexusBot trial has ended', html: `<h1>Your trial has ended, ${name}</h1><p>Your data is preserved for 30 days. <a href="${config.app.dashboardUrl}/billing/upgrade">Upgrade anytime</a>.</p>` });
  }

  async sendPaymentReceipt(email: string, amount: string, planName: string) {
    await this.send({ to: email, subject: `NexusBot payment receipt — ${amount}`, html: `<h1>Payment Received</h1><p>Thank you! ${amount} for ${planName}. <a href="${config.app.dashboardUrl}/billing">View billing</a>.</p>` });
  }

  async sendPaymentFailed(email: string, name: string) {
    await this.send({ to: email, subject: 'Action required: payment failed', html: `<h1>Payment failed, ${name}</h1><p>Please <a href="${config.app.dashboardUrl}/billing">update your payment method</a>.</p>` });
  }

  async sendSubscriptionCancelled(email: string, name: string, endsAt: string) {
    await this.send({ to: email, subject: "We're sorry to see you go", html: `<h1>Subscription cancelled, ${name}</h1><p>Bot runs until ${endsAt}. <a href="${config.app.dashboardUrl}/billing">Reactivate</a>.</p>` });
  }
}
