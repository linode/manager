import { OAuthClient } from '@akamai/compute-ui-core/authentication';
import * as Sentry from '@sentry/react';

import { getEnvLocalStorageOverrides } from 'src/utilities/storage';

const localStorageOverrides = getEnvLocalStorageOverrides();

export const oauthClient = new OAuthClient({
  clientId:
    localStorageOverrides?.clientID ?? import.meta.env.COMPUTE_CLIENT_ID ?? '',
  onError: (error) => Sentry.captureException(error),
  server:
    localStorageOverrides?.loginRoot ?? import.meta.env.COMPUTE_LOGIN_ROOT,
});

export const getIsAdminToken = (token: string) =>
  token.toLowerCase().startsWith('admin');
