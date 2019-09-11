import { LDClient as _LDClient } from 'launchdarkly-js-client-sdk';
import { withLDConsumer } from 'launchdarkly-react-client-sdk';
import { FlagSet } from 'src/featureFlags';

export interface FeatureFlagConsumerProps {
  flags: FlagSet;
  ldClient: LDClient;
}

/* tslint:disable-next-line */
export interface LDClient extends _LDClient {}

export default withLDConsumer();
