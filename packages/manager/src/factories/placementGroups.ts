import * as Factory from 'factory.ts';

import { pickRandom } from 'src/utilities/random';

import type {
  CreatePlacementGroupPayload,
  PlacementGroup,
} from '@linode/api-v4';

export const placementGroupFactory = Factory.Sync.makeFactory<PlacementGroup>({
  affinity_type: 'anti_affinity',
  id: Factory.each((id) => id),
  is_compliant: Factory.each(() => pickRandom([true, false])),
  label: Factory.each((id) => `pg-${id}`),
  linode_ids: [0, 1, 2, 3, 5, 6, 7, 8, 43],
  region: 'us-east',
});

export const createPlacementGroupPayloadFactory = Factory.Sync.makeFactory<CreatePlacementGroupPayload>(
  {
    affinity_type: 'anti_affinity',
    label: Factory.each((id) => `mock-pg-${id}`),
    region: pickRandom(['us-east', 'us-southeast', 'ca-central']),
    strict: true,
  }
);
