import * as md5 from 'md5';
import * as React from 'react';
import { useLDClient } from 'src/containers/withFeatureFlagProvider.container';

interface Props {
  accountCountry?: string;
  accountError?: Linode.ApiFieldError[];
  userID?: number;
  username?: string;
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
    username
  } = props;
  const client = useLDClient();
  React.useEffect(() => {
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

    if (client && userID && country && username) {
      client
        .identify({
          key: md5(String(userID)),
          country,
          custom: {
            username
          }
        })
        .then(() => setFlagsLoaded())
        /**
         * We could handle this in other ways, but for now don't let a
         * LD bung-up block the app from loading.
         */

        .catch(() => setFlagsLoaded());
    }
  }, [client, userID, accountCountry, username]);

  return null;
};

export default IdentifyUser;
