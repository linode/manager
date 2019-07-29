import * as md5 from 'md5';
import * as React from 'react';
import { useLDClient } from 'src/containers/withFeatureFlagProvider.container';

interface Props {
  userID?: number;
  setFlagsLoaded: () => void;
}

/**
 * This has to be a FC rather than just a function
 * to use the useLDClient hook. We could pass in
 * the client as a prop, but the parents are class components
 * and this is a good side-effect usage of useEffect().
 */

export const IdentifyUser: React.FC<Props> = props => {
  const { setFlagsLoaded, userID } = props;
  const client = useLDClient();
  React.useEffect(() => {
    if (client && userID) {
      client
        .identify({
          key: md5(String(userID))
        })
        .then(() => setFlagsLoaded())
        /**
         * We could handle this in other ways, but for now don't let a
         * LD bung-up block the app from loading.
         */

        .catch(() => setFlagsLoaded());
    }
  }, [client, userID]);

  return null;
};

export default IdentifyUser;
