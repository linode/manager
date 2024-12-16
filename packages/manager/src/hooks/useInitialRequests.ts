import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { accountQueries } from 'src/queries/account/queries';
import { profileQueries } from 'src/queries/profile/profile';
import { getAuthToken } from 'src/utilities/authentication';

/**
 * This hook is responsible for making Cloud Manager's initial requests.
 * It exposes a `isLoading` value so that we can render a loading page
 * as we make our inital requests.
 */
export const useInitialRequests = () => {
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    /**
     * this is the case where we've just come back from login and need
     * to show the children onMount
     */
    if (getAuthToken().token) {
      makeInitialRequests();
    }
    // We only want this to run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
