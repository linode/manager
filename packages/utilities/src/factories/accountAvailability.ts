import { Factory } from './factoryProxy';

import { pickRandom } from '../helpers';

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
