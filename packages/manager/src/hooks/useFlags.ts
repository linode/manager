import { useFlags as ldUseFlags } from 'launchdarkly-react-client-sdk';
import { useSelector } from 'react-redux';

import type { FlagSet } from 'src/featureFlags';
import type { ApplicationState } from 'src/store';
export { useLDClient } from 'launchdarkly-react-client-sdk';

/**
 * Wrapper around LaunchDarkly, so that we can replace this context
 * without updating imports in every consumer.
 *
 * The useLDC client may be needed in some cases, which in turn
 * may require us to do a more involved abstraction.
 *
 * Usage:
 *
 * const flags = useFlags();
 */
// export default ldUseFlags as () => FlagSet;

export const useFlags = () => {
  const flags = ldUseFlags() as FlagSet;

  // Mock flags are set by custom dev tools and saved in local storage, and override real flags.
  const mockFlags = useSelector(
    (state: ApplicationState) => state.mockFeatureFlags
  );

  return {
    ...flags,
    ...mockFlags,
  };
};
