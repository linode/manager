import * as Factory from 'factory.ts';

import { pickRandom } from 'src/utilities/random';

import type {
  CreatePlacementGroupPayload,
  PlacementGroup,
} from '@linode/api-v4';

export const placementGroupFactory = Factory.Sync.makeFactory<PlacementGroup>({
  affinity_type: Factory.each(() => pickRandom(['affinity', 'anti-affinity'])),
  compliant: Factory.each(() => pickRandom([true, false])),
  id: Factory.each((id) => id),
  label: Factory.each((id) => `pg-${id}`),
  linode_ids: Factory.each(() => [
    pickRandom([1, 2, 3]),
    pickRandom([4, 5, 6]),
    pickRandom([7, 8, 9]),
  ]),
  region: Factory.each(() =>
    pickRandom(['us-east', 'us-southeast', 'ca-central'])
  ),
});

export const createPlacementGroupPayloadFactory = Factory.Sync.makeFactory<CreatePlacementGroupPayload>(
  {
    affinity_type: 'anti-affinity',
    label: Factory.each((id) => `mock-pg-${id}`),
    region: pickRandom(['us-east', 'us-southeast', 'ca-central']),
  }
);
