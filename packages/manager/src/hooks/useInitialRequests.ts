import { getUserPreferences } from '@linode/api-v4/lib/profile';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { accountQueries } from 'src/queries/account/queries';
import { profileQueries } from 'src/queries/profile/profile';

/**
 * This hook is responsible for making Cloud Manager's initial requests.
 * It exposes a `isLoading` value so that we can render a loading page
 * as we make our inital requests.
 */
export const useInitialRequests = () => {
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    makeInitialRequests();
  }, []);

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
      queryClient.prefetchQuery(accountQueries.account),

      // Is a user managed
      queryClient.prefetchQuery(accountQueries.settings),

      // Username and whether a user is restricted
      queryClient.prefetchQuery(profileQueries.profile()),

      // preferences
      queryClient.prefetchQuery({
        queryFn: getUserPreferences,
        queryKey: ['preferences'],
      }),
    ];

    try {
      await Promise.all(dataFetchingPromises);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading };
};
