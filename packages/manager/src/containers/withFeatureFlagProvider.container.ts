import { withLDProvider } from 'launchdarkly-react-client-sdk';

import { LAUNCH_DARKLY_API_KEY } from 'src/constants';

export default withLDProvider({
  clientSideID: LAUNCH_DARKLY_API_KEY
});
