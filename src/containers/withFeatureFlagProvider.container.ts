import { useLDClient, withLDProvider } from 'launchdarkly-react-client-sdk';

import { LAUNCH_DARKLY_API_KEY } from 'src/constants';

export { useLDClient };

export default withLDProvider({
  clientSideID: LAUNCH_DARKLY_API_KEY,
  user: {
    key: 'anonymous' // shared key for anonymous users (not yet logged in)
  }
});
