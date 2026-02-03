import { accountQueries, profileQueries } from '@linode/queries';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { getClientId } from 'src/OAuth/constants';
import {
  clearStorageAndRedirectToLogout,
  getIsAdminToken,
  getLoginURL,
  redirectToLogin,
} from 'src/OAuth/oauth';
import { storage } from 'src/utilities/storage';

import type { ApplicationState } from 'src/store';

/**
 * This hook is responsible for making Cloud Manager's initial requests.
 * It also verifies that the token in localStorage belongs to the same user
 * as the Flask session cookie (via /oauth/verify).
 *
 * It exposes a `isLoading` value so that we can render a loading page
 * as we make our initial requests.
 */
export const useInitialRequests = () => {
  const queryClient = useQueryClient();

  const token = storage.authentication.token.get();
  const tokenExists = Boolean(token);

  const pendingUpload = useSelector(
    (state: ApplicationState) => state.pendingUpload
  );

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const isAuthCallback =
      window.location.pathname === '/oauth/callback' ||
      window.location.pathname === '/admin/callback';

    if (isAuthCallback) {
      setIsLoading(false);
      return;
    }

    if (!tokenExists && !pendingUpload) {
      redirectToLogin();
      return;
    }

    if (!tokenExists) {
      setIsLoading(false);
      return;
    }

    validateTokenAndSession();
  }, [tokenExists, pendingUpload]);

  const validateTokenAndSession = async () => {
    const storedToken = storage.authentication.token.get();

    if (!storedToken) {
      makeInitialRequests();
      return;
    }

    if (getIsAdminToken(storedToken)) {
      makeInitialRequests();
      return;
    }

    try {
      const tokenValue = storedToken.replace(/^Bearer\s+/i, '');

      const response = await fetch(
        `${getLoginURL()}/oauth/verify?client_id=${getClientId()}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${tokenValue}`,
          },
          method: 'POST',
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.match === true) {
          makeInitialRequests();
          return;
        }

        clearStorageAndRedirectToLogout();
        return;
      }

      clearStorageAndRedirectToLogout();
    } catch (error) {
      makeInitialRequests();
    }
  };

  /**
   * We make a series of requests for data on app load. The flow is:
   * 1. App begins load; users see splash screen
   * 2. Initial requests (in makeInitialRequests) are made (account, profile, etc.)
   * 3. Initial requests complete; app is marked as done loading
   */
  const makeInitialRequests = async () => {
    // When loading Lish we avoid all this extra data loading
    if (window.location?.pathname?.match(/linodes\/[0-9]+\/lish/)) {
      setIsLoading(false);
      return;
    }

    try {
      // Initial Requests: Things we want immediately (before rendering the app)
      await Promise.all([
        queryClient.prefetchQuery(accountQueries.account),
        queryClient.prefetchQuery(accountQueries.settings),
        queryClient.prefetchQuery(profileQueries.profile()),
        queryClient.prefetchQuery(profileQueries.preferences),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading };
};
