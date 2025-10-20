import { OAuthClient } from "@linode/oauth";

export const oauthClient = new OAuthClient({
  clientId: import.meta.env.REACT_APP_CLIENT_ID ?? '99f2a0aca6bf702572c7',
  callbackUrl: import.meta.env.REACT_APP_APP_ROOT ? `${import.meta.env.REACT_APP_APP_ROOT}/oauth/callback` : "http://localhost:4000/oauth/callback",
});
