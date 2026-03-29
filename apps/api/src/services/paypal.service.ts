import { config } from '../config';
import { BadRequestError } from '../utils/errors';

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalSubscription {
  id: string;
  status: string;
  plan_id: string;
  subscriber: {
    email_address: string;
    payer_id: string;
  };
  billing_info: {
    next_billing_time: string;
    last_payment: {
      amount: { value: string; currency_code: string };
      time: string;
    };
  };
}

export class PayPalService {
  private baseUrl = config.env === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${config.paypal.clientId}:${config.paypal.clientSecret}`,
    ).toString('base64');

    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new BadRequestError('Failed to get PayPal access token');
    const data = (await res.json()) as PayPalTokenResponse;
    return data.access_token;
  }

  async createSubscription(params: {
    planId: string;
    tenantId: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<{ subscriptionId: string; approvalUrl: string }> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: params.planId,
        custom_id: params.tenantId,
        application_context: {
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
          brand_name: 'NexusBot',
          user_action: 'SUBSCRIBE_NOW',
        },
      }),
    });

    if (!res.ok) throw new BadRequestError('Failed to create PayPal subscription');
    const data = (await res.json()) as {
      id: string;
      links: Array<{ rel: string; href: string }>;
    };

    const approvalUrl = data.links.find((l) => l.rel === 'approve')?.href;
    if (!approvalUrl) throw new BadRequestError('No PayPal approval URL returned');

    return { subscriptionId: data.id, approvalUrl };
  }

  async getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new BadRequestError('Failed to get PayPal subscription');
    return (await res.json()) as PayPalSubscription;
  }

  async cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
    const token = await this.getAccessToken();

    const res = await fetch(
      `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      },
    );

    if (!res.ok) throw new BadRequestError('Failed to cancel PayPal subscription');
  }

  async verifyWebhookSignature(params: {
    authAlgo: string;
    certUrl: string;
    transmissionId: string;
    transmissionSig: string;
    transmissionTime: string;
    webhookEvent: unknown;
  }): Promise<boolean> {
    const token = await this.getAccessToken();

    const res = await fetch(
      `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: params.authAlgo,
          cert_url: params.certUrl,
          transmission_id: params.transmissionId,
          transmission_sig: params.transmissionSig,
          transmission_time: params.transmissionTime,
          webhook_id: config.paypal.webhookId,
          webhook_event: params.webhookEvent,
        }),
      },
    );

    if (!res.ok) return false;
    const data = (await res.json()) as { verification_status: string };
    return data.verification_status === 'SUCCESS';
  }

  getPlanId(planId: string): string | null {
    const map: Record<string, string> = {
      pro_monthly: config.paypal.plans.proMonthly,
      pro_annual: config.paypal.plans.proAnnual,
      ultimate_monthly: config.paypal.plans.ultimateMonthly,
      ultimate_annual: config.paypal.plans.ultimateAnnual,
    };
    return map[planId] || null;
  }
}
