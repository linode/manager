import { OAuthClient } from '@linode/oauth';
import * as Sentry from '@sentry/react';

import { getAppRoot, getClientId, getLoginURL } from './constants';

export const oauthClient = new OAuthClient({
  clientId: getClientId(),
  callbackUrl: `${getAppRoot()}/oauth/callback`,
  loginUrl: getLoginURL(),
  onError(error) {
    Sentry.captureException(error);
  }
});
