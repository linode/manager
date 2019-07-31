import { useFlags } from 'launchdarkly-react-client-sdk';
import { FlagSet } from 'src/featureFlags';
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
export default useFlags as () => FlagSet;
