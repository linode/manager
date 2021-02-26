import { APIError } from '@linode/api-v4/lib/types';
import * as md5 from 'md5';
import * as React from 'react';
import { LAUNCH_DARKLY_API_KEY } from 'src/constants';
import { useLDClient } from 'src/containers/withFeatureFlagProvider.container';
import { initGTMUser } from './analytics';
import { configureErrorReportingUser } from './exceptionReporting';
import useFeatureFlagsLoad from './hooks/useFeatureFlagLoad';

interface Props {
  accountCountry?: string;
  accountError?: APIError[];
  userID?: number;
  username?: string;
  taxID?: string;
  euuid?: string;
}

/**
 * This has to be a FC rather than just a function
 * to use the useLDClient hook. We could pass in
 * the client as a prop, but the parents are class components
 * and this is a good side-effect usage of useEffect().
 */

export const IdentifyUser: React.FC<Props> = props => {
  const {
    userID,
    accountCountry,
    accountError,
    username,
    taxID,
    euuid,
  } = props;
  const client = useLDClient();

  const { setFeatureFlagsLoaded } = useFeatureFlagsLoad();

  // Configure user for error reporting once we have the info we need.
  React.useEffect(() => {
    if (userID && username) {
      configureErrorReportingUser(String(userID), username);
    }
  }, [userID, username]);

  // Configure user for GTM once we have the info we need.
  React.useEffect(() => {
    if (euuid) {
      initGTMUser(euuid);
    }
  }, [euuid]);

  React.useEffect(() => {
    if (!LAUNCH_DARKLY_API_KEY) {
      /**
       * if there's no Launch Darkly ID passed as an .env variable,
       * we can't communicate with the LD service, so just resolve
       * our loading state and move on - we'll render the app
       * without any context of feature flags.
       */
      setFeatureFlagsLoaded();
    } else {
      /**
       * returns unknown if:
       * 1. We have an error from the API (will happen if you're a restricted user)
       * 2. The user has not set a country yet
       */
      const country = accountError
        ? 'Unknown'
        : accountCountry === ''
        ? 'Unknown'
        : accountCountry;

      const _taxID = accountError
        ? 'Unknown'
        : taxID === ''
        ? 'Unknown'
        : taxID;

      if (client && userID && country && username && _taxID) {
        client
          .identify({
            key: md5(String(userID)),
            name: username,
            country,
            custom: {
              taxID: _taxID,
            },
          })
          .then(() => setFeatureFlagsLoaded())
          /**
           * We could handle this in other ways, but for now don't let a
           * LD bung-up block the app from loading.
           */

          .catch(() => setFeatureFlagsLoaded());
      }
    }
  }, [client, userID, accountCountry, username, taxID]);

  return null;
};

export default IdentifyUser;
