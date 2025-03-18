import { pickRandom } from '@linode/utilities';
import { Factory } from '@linode/utilities';

import type { AccountAvailability } from '@linode/api-v4';

export const accountAvailabilityFactory = Factory.Sync.makeFactory<AccountAvailability>(
  {
    region: pickRandom(['us-mia', 'ap-south', 'ap-northeast']),
    unavailable: pickRandom([
      ['Block Storage'],
      ['Linodes', 'Block Storage', 'Kubernetes', 'NodeBalancers'],
    ]),
  }
);
