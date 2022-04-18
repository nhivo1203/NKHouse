import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`,{apiVersion:'2020-08-27'});

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({
      /* eslint-disable @typescript-eslint/camelcase */
      grant_type: "authorization_code",
      code
      /* eslint-enable @typescript-eslint/camelcase */
    });

    return response;
  },
  charge: async (amount1: number, source: string, stripeAccount: string) => {
    /* eslint-disable @typescript-eslint/camelcase */
    const amount = amount1 * 1000;
    const res = await client.charges.create(
      {
        amount,
        currency: "vnd",
        source,
        application_fee_amount: Math.round(amount * 0.05)
      },
      {
        stripeAccount: stripeAccount
      }
    );
    /* eslint-enable @typescript-eslint/camelcase */

    if (res.status !== "succeeded") {
      throw new Error("failed to create charge with Stripe");
    }
  }
};
