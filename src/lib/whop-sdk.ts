import Whop from '@whop/sdk';

export const whopSdk = new Whop({
  appID: process.env.WHOP_APP_ID!,
  apiKey: process.env.WHOP_API_KEY!,
});