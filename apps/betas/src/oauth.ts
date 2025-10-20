import { OAuthClient } from "@linode/oauth";

export const oauthClient = new OAuthClient({
  clientId: '99f2a0aca6bf702572c7',
  callbackUrl: "http://localhost:4000/oauth/callback",
});
