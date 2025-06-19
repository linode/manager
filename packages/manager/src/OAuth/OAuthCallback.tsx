import * as Sentry from '@sentry/react';
import React from 'react';
import type { RouteComponentProps } from 'react-router-dom';

import { SplashScreen } from 'src/components/SplashScreen';

import { clearStorageAndRedirectToLogout, handleOAuthCallback } from './oauth';

/**
 * Login will redirect back to Cloud Manager with a URL like:
 * https://cloud.linode.com/oauth/callback?returnTo=%2F&state=066a6ad9-b19a-43bb-b99a-ef0b5d4fc58d&code=42ddf75dfa2cacbad897
 *
 * We will handle taking the code, turning it into an access token, and start a Cloud Manager session.
 */
export const OAuthCallback = (props: RouteComponentProps) => {
  const authenticate = async () => {
    try {
      const { returnTo } = await handleOAuthCallback({
        params: location.search,
      });

      props.history.push(returnTo);
    } catch (error) {
      Sentry.captureException(error);
      clearStorageAndRedirectToLogout();
    }
  };

  React.useEffect(() => {
    authenticate();
  }, []);

  return <SplashScreen />;
};
