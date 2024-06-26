import { AccountAvailability } from '@linode/api-v4';
import Factory from 'src/factories/factoryProxy';

import { pickRandom } from 'src/utilities/random';

export const accountAvailabilityFactory = Factory.Sync.makeFactory<AccountAvailability>(
  {
    region: pickRandom(['us-mia', 'ap-south', 'ap-northeast']),
    unavailable: pickRandom([
      ['Block Storage'],
      ['Linodes', 'Block Storage', 'Kubernetes', 'NodeBalancers'],
    ]),
  }
);
