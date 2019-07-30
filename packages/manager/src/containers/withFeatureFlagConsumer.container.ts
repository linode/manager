import { withLDConsumer } from 'launchdarkly-react-client-sdk';
import { FlagSet } from 'src/featureFlags';

export interface FeatureFlagConsumerProps {
  flags: FlagSet;
  ldClient: any;
}

export default withLDConsumer();
