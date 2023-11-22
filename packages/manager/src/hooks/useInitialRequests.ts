import { getAccountInfo, getAccountSettings } from '@linode/api-v4/lib/account';
import { getUserPreferences } from '@linode/api-v4/lib/profile';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useStore } from 'react-redux';

import { startEventsInterval } from 'src/events';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { usePendingUpload } from 'src/hooks/usePendingUpload';
import { queryKey as accountQueryKey } from 'src/queries/account';
import { profileQueries } from 'src/queries/profile';
import { redirectToLogin } from 'src/session';

/**
 * This hook is responsible for making Cloud Manager's initial requests.
 * It exposes a `isLoading` value so that we can render a loading page
 * as we make our inital requests.
 */
export const useInitialRequests = () => {
  const store = useStore();
  const queryClient = useQueryClient();

  const { token } = useAuthentication();
  const isAuthenticated = Boolean(token);
  const pendingUpload = usePendingUpload();

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (
      !isAuthenticated &&
      // Do not redirect to Login if there is a pending image upload.
      !pendingUpload
    ) {
      redirectToLogin(location.pathname, location.search);
    }

    /**
     * this is the case where we've just come back from login and need
     * to show the children onMount
     */
    if (isAuthenticated) {
      makeInitialRequests();
    }

    // We only want this useEffect running when `isAuthenticated` changes.
  }, [isAuthenticated]);

  /**
   * We make a series of requests for data on app load. The flow is:
   * 1. App begins load; users see splash screen
   * 2. Initial requests (in makeInitialRequests) are made (account, profile, etc.)
   * 3. Initial requests complete; app is marked as done loading
   * 4. As splash screen goes away, secondary requests (in makeSecondaryRequests -- Linodes, types, regions)
   * are kicked off
   */
  const makeInitialRequests = async () => {
    // When loading Lish we avoid all this extra data loading
    if (window.location?.pathname?.match(/linodes\/[0-9]+\/lish/)) {
      setIsLoading(false);
      return;
    }

    // Initial Requests: Things we need immediately (before rendering the app)
    const dataFetchingPromises: Promise<any>[] = [
      // Fetch user's account information
      queryClient.prefetchQuery({
        queryFn: getAccountInfo,
        queryKey: accountQueryKey,
      }),

      // Username and whether a user is restricted
      queryClient.prefetchQuery(profileQueries.info),

      // Is a user managed
      queryClient.prefetchQuery({
        queryFn: getAccountSettings,
        queryKey: 'account-settings',
      }),

      // preferences
      queryClient.prefetchQuery({
        queryFn: getUserPreferences,
        queryKey: 'preferences',
      }),
    ];

    // Start events polling
    startEventsInterval(store, queryClient);

    try {
      await Promise.all(dataFetchingPromises);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading };
};
