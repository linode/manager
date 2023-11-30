import { AccountAvailability } from '@linode/api-v4';
import * as Factory from 'factory.ts';

import { pickRandom } from 'src/utilities/random';

export const accountAvailabilityFactory = Factory.Sync.makeFactory<AccountAvailability>(
  {
    id: pickRandom(['us-mia', 'ap-south', 'ap-northeast']),
    unavailable: pickRandom([
      ['Block Storage'],
      ['Linodes', 'Block Storage', 'Kubernetes', 'NodeBalancers'],
    ]),
  }
);
