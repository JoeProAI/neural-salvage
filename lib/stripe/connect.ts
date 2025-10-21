import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export class StripeConnectService {
  async createConnectAccount(userId: string, email: string) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId,
        },
      });

      return account;
    } catch (error) {
      console.error('Error creating Connect account:', error);
      throw error;
    }
  }

  async createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      console.error('Error creating account link:', error);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    sellerId: string,
    platformFeePercentage: number = 10
  ) {
    try {
      const platformFee = Math.round(amount * (platformFeePercentage / 100));
      const sellerAmount = amount - platformFee;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        application_fee_amount: platformFee * 100,
        transfer_data: {
          destination: sellerId,
        },
        metadata: {
          sellerAmount: sellerAmount.toString(),
          platformFee: platformFee.toString(),
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async createCheckoutSession(
    assetId: string,
    assetName: string,
    price: number,
    sellerId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const platformFeePercentage = parseInt(
        process.env.PLATFORM_FEE_PERCENTAGE || '10'
      );
      const platformFee = Math.round(price * (platformFeePercentage / 100));

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: assetName,
                metadata: {
                  assetId,
                },
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: platformFee * 100,
          transfer_data: {
            destination: sellerId,
          },
          metadata: {
            assetId,
            sellerId,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          assetId,
          sellerId,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async getAccountStatus(accountId: string) {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      };
    } catch (error) {
      console.error('Error getting account status:', error);
      throw error;
    }
  }

  async createLoginLink(accountId: string) {
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      return loginLink.url;
    } catch (error) {
      console.error('Error creating login link:', error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
      );
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      throw error;
    }
  }
}

export const stripeConnect = new StripeConnectService();