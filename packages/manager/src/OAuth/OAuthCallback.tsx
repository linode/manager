import * as Sentry from '@sentry/react';
import { useNavigate } from '@tanstack/react-router';
import { useSearch } from '@tanstack/react-router';
import React from 'react';

import { SplashScreen } from 'src/components/SplashScreen';

import { clearStorageAndRedirectToLogout, handleOAuthCallback } from './oauth';

import type { LinkProps } from '@tanstack/react-router';

/**
 * Login will redirect back to Cloud Manager with a URL like:
 * https://cloud.linode.com/oauth/callback?returnTo=%2F&state=066a6ad9-b19a-43bb-b99a-ef0b5d4fc58d&code=42ddf75dfa2cacbad897
 *
 * We will handle taking the code, turning it into an access token, and start a Cloud Manager session.
 */
export const OAuthCallback = () => {
  const navigate = useNavigate();
  const search = useSearch({
    from: '/oauth/callback',
  });

  const hasStartedAuth = React.useRef(false);
  const isAuthenticating = React.useRef(false);

  React.useEffect(() => {
    // Prevent running if already started or currently running
    if (hasStartedAuth.current || isAuthenticating.current) {
      return;
    }

    hasStartedAuth.current = true;
    isAuthenticating.current = true;

    const authenticate = async () => {
      try {
        const { returnTo } = await handleOAuthCallback({
          params: search,
        });

        // None of these paths are valid return destinations
        const invalidReturnToPaths: LinkProps['to'][] = [
          '/logout',
          '/admin/callback',
          '/oauth/callback',
          '/cancel',
        ];

        const isInvalidReturnTo =
          !returnTo || invalidReturnToPaths.some((path) => returnTo === path);

        if (isInvalidReturnTo) {
          navigate({ to: '/' });
          return;
        }

        navigate({ to: returnTo });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        Sentry.captureException(error);
        clearStorageAndRedirectToLogout();
      } finally {
        isAuthenticating.current = false;
      }
    };

    authenticate();
  }, [navigate, search]);

  return <SplashScreen />;
};
