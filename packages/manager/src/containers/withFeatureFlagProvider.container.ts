import { useLDClient, withLDProvider } from 'launchdarkly-react-client-sdk';

import { LAUNCH_DARKLY_API_KEY } from 'src/constants';

export { useLDClient };

/**
 * only wrap the component in the HOC if we've passed
 * the Launch Darkly API key as an environment variable.
 *
 * Otherwise, we can't communicate with the Launch Darkly API
 * which makes this HOC have no effect - just return the component
 * as normal in this case
 */
const featureFlagProvider = LAUNCH_DARKLY_API_KEY
  ? withLDProvider({
      clientSideID: LAUNCH_DARKLY_API_KEY,
      /**
       * Initialize the app with an anonymous user.
       */
      user: {
        key: 'anonymous',
        anonymous: true
      }
    })
  : (component: React.ComponentType) => component;

export default featureFlagProvider;
