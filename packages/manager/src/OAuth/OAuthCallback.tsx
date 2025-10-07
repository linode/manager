import * as Sentry from '@sentry/react';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { SplashScreen } from 'src/components/SplashScreen';

import { oauthClient } from './oauth';

/**
 * Login will redirect back to Cloud Manager with a URL like:
 * https://cloud.linode.com/oauth/callback?returnTo=%2F&state=066a6ad9-b19a-43bb-b99a-ef0b5d4fc58d&code=42ddf75dfa2cacbad897
 *
 * We will handle taking the code, turning it into an access token, and start a Cloud Manager session.
 */
export const OAuthCallback = () => {
  const navigate = useNavigate();
  const authenticate = async () => {
    try {
      const { returnTo } = await oauthClient.handleOAuthCallback({
        params: location.search,
      });

      navigate({ to: returnTo });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      Sentry.captureException(error);
      oauthClient.clearStorageAndRedirectToLogout();
    }
  };

  React.useEffect(() => {
    authenticate();
  }, []);

  return <SplashScreen />;
};
