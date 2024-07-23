import Factory from 'src/factories/factoryProxy';

import { pickRandom } from 'src/utilities/random';

import type {
  CreatePlacementGroupPayload,
  PlacementGroup,
} from '@linode/api-v4';

export const placementGroupFactory = Factory.Sync.makeFactory<PlacementGroup>({
  placement_group_type: 'anti_affinity:local',
  id: Factory.each((id) => id),
  is_compliant: Factory.each(() => pickRandom([true, false])),
  placement_group_policy: 'strict',
  label: Factory.each((id) => `pg-${id}`),
  members: [
    {
      is_compliant: true,
      linode_id: 1,
    },
    {
      is_compliant: true,
      linode_id: 2,
    },
    {
      is_compliant: true,
      linode_id: 3,
    },
    {
      is_compliant: true,
      linode_id: 5,
    },
    {
      is_compliant: true,
      linode_id: 6,
    },
    {
      is_compliant: true,
      linode_id: 7,
    },
    {
      is_compliant: true,
      linode_id: 8,
    },
    {
      is_compliant: true,
      linode_id: 9,
    },
    {
      is_compliant: false,
      linode_id: 43,
    },
  ],
  region: 'us-east',
});

export const createPlacementGroupPayloadFactory = Factory.Sync.makeFactory<CreatePlacementGroupPayload>(
  {
    placement_group_type: 'anti_affinity:local',
    placement_group_policy: 'strict',
    label: Factory.each((id) => `mock-pg-${id}`),
    region: pickRandom(['us-east', 'us-southeast', 'ca-central']),
  }
);
