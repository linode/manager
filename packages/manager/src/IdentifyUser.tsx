import { APIError } from 'linode-js-sdk/lib/types';
import * as md5 from 'md5';
import * as React from 'react';
import { LAUNCH_DARKLY_API_KEY } from 'src/constants';
import { useLDClient } from 'src/containers/withFeatureFlagProvider.container';

interface Props {
  accountCountry?: string;
  accountError?: APIError[];
  userID?: number;
  username?: string;
  taxID?: string;
  setFlagsLoaded: () => void;
}

/**
 * This has to be a FC rather than just a function
 * to use the useLDClient hook. We could pass in
 * the client as a prop, but the parents are class components
 * and this is a good side-effect usage of useEffect().
 */

export const IdentifyUser: React.FC<Props> = props => {
  const {
    setFlagsLoaded,
    userID,
    accountCountry,
    accountError,
    username,
    taxID
  } = props;
  const client = useLDClient();

  React.useEffect(() => {
    /**
     * if there's no Launch Darkly ID passed as an .env variable,
     * we can't communicate with the LD service, so just resolve
     * our loading state and move on - we'll render the app
     * without any context of feature flags.
     */
    if (!LAUNCH_DARKLY_API_KEY) {
      setFlagsLoaded();
    }

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

    const _taxID = accountError ? 'Unknown' : taxID === '' ? 'Unknown' : taxID;

    if (client && userID && country && username && _taxID) {
      client
        .identify({
          key: md5(String(userID)),
          name: username,
          country,
          custom: {
            taxID: _taxID
          }
        })
        .then(() => setFlagsLoaded())
        /**
         * We could handle this in other ways, but for now don't let a
         * LD bung-up block the app from loading.
         */

        .catch(() => setFlagsLoaded());
    }
  }, [client, userID, accountCountry, username, taxID]);

  return null;
};

export default IdentifyUser;
