import { useLDClient, withLDProvider } from 'launchdarkly-react-client-sdk';

import { LAUNCH_DARKLY_API_KEY } from 'src/constants';

export { useLDClient };

export default withLDProvider({
  clientSideID: LAUNCH_DARKLY_API_KEY,
  /**
   * Initialize the app with an anonymous user.
   */
  user: {
    key: 'anonymous',
    anonymous: true
  }
});
