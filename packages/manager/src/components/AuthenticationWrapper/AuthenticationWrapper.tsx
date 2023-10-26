import { getAccountInfo, getAccountSettings } from '@linode/api-v4/lib/account';
import { getProfile, getUserPreferences } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { useSelector, useStore } from 'react-redux';

import { startEventsInterval } from 'src/events';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { queryKey as accountQueryKey } from 'src/queries/account';
import { redirectToLogin } from 'src/session';
import { ApplicationState } from 'src/store';
import { handleInitTokens } from 'src/store/authentication/authentication.actions';

export const usePendingUpload = () => {
  return useSelector((state: ApplicationState) => state.pendingUpload);
};

export const useInitialRequests = () => {
  const store = useStore();
  const queryClient = useQueryClient();

  const { token } = useAuthentication();
  const isAuthenticated = Boolean(token);
  const pendingUpload = usePendingUpload();

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    /**
     * set redux state to what's in local storage
     * or expire the tokens if the expiry time is in the past
     *
     * if nothing exists in local storage, we get shot off to login
     */
    store.dispatch(handleInitTokens());
  }, []);

  React.useEffect(() => {
    if (
      !isAuthenticated &&
      // Do not redirect to Login if there is a pending image upload.
      !pendingUpload &&
      !isLoading
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
  }, [isAuthenticated, isLoading, pendingUpload]);

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
      queryClient.prefetchQuery({
        queryFn: getProfile,
        queryKey: 'profile',
      }),

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
