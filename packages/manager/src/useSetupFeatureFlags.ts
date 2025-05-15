import { useAccount, useProfile } from '@linode/queries';
import { useLDClient } from 'launchdarkly-react-client-sdk';
import * as React from 'react';

import { LAUNCH_DARKLY_API_KEY } from 'src/constants';

import { configureErrorReportingUser } from './exceptionReporting';

/**
 * This hook uses Linode account data to set Sentry and Launch Darkly context.
 * It exposes a `areFeatureFlagsLoading` value so we can display a loading
 * page while we wait for our feature flags to be setup.
 */
export const useSetupFeatureFlags = () => {
  const { data: account, error: accountError } = useAccount();
  const { data: profile } = useProfile();

  const client = useLDClient();

  const [areFeatureFlagsLoading, setAreFeatureFlagsLoading] =
    React.useState(true);

  const userID = profile?.uid;
  const username = profile?.username;

  // Configure user for error reporting once we have the info we need.
  React.useEffect(() => {
    if (userID && username) {
      configureErrorReportingUser(String(userID), username);
    }
  }, [userID, username]);

  React.useEffect(() => {
    if (!LAUNCH_DARKLY_API_KEY) {
      /**
       * if there's no Launch Darkly ID passed as an .env variable,
       * we can't communicate with the LD service, so just resolve
       * our loading state and move on - we'll render the app
       * without any context of feature flags.
       */
      setAreFeatureFlagsLoading(false);
    } else {
      /**
       * returns unknown if:
       * 1. We have an error from the API (will happen if you're a restricted user)
       * 2. The user has not set a country yet
       */
      const country = accountError
        ? 'Unknown'
        : account?.country === ''
          ? 'Unknown'
          : account?.country;

      const taxID = accountError
        ? 'Unknown'
        : account?.tax_id === ''
          ? 'Unknown'
          : account?.tax_id;
      if (client && country && username && taxID) {
        client
          .identify({
            anonymous: true,
            country,
            kind: 'user',
            privateAttributes: ['country, taxID'],
            taxID,
          })
          .then(() => setAreFeatureFlagsLoading(false))
          /**
           * We could handle this in other ways, but for now don't let a
           * LD bung-up block the app from loading.
           */

          .catch(() => setAreFeatureFlagsLoading(false));
      } else {
        // We "setFeatureFlagsLoaded" here because if the API is
        // in maintenance mode, we can't fetch the user's username.
        // Therefore, the `if` above won't "setFeatureFlagsLoaded".

        // We also need to make sure client is defined. Launch Darkly has a weird API.
        // If client is undefined, that means flags are loading. Even if flags fail to load,
        // client will become defined and we and allow the app to render.

        // If we're being honest, featureFlagsLoading shouldn't be tracked by Redux
        // and this code should go away eventually.
        if (client) {
          setAreFeatureFlagsLoading(false);
        }
      }
    }
  }, [client, username, account, accountError]);

  return { areFeatureFlagsLoading };
};
