import { Factory } from '@linode/utilities';

import type {
  Subnet,
  SubnetAssignedLinodeData,
} from '@linode/api-v4/lib/vpcs/types';

// NOTE: Changing to fixed array length for the interfaces and linodes fields of the
// subnetAssignedLinodeDataFactory and subnetFactory respectively -- see [M3-7227] for more details

export const subnetAssignedLinodeDataFactory = Factory.Sync.makeFactory<SubnetAssignedLinodeData>(
  {
    id: Factory.each((i) => i),
    interfaces: Factory.each((i) =>
      Array.from({ length: 5 }, (_, arrIdx) => ({
        active: false,
        config_id: i * 10 + arrIdx,
        id: i * 10 + arrIdx,
      }))
    ),
  }
);

export const subnetFactory = Factory.Sync.makeFactory<Subnet>({
  created: '2023-07-12T16:08:53',
  id: Factory.each((i) => i),
  ipv4: '0.0.0.0/0',
  label: Factory.each((i) => `subnet-${i}`),
  linodes: Factory.each((i) =>
    Array.from({ length: 5 }, (_, arrIdx) =>
      subnetAssignedLinodeDataFactory.build({
        id: i * 10 + arrIdx,
      })
    )
  ),
  updated: '2023-07-12T16:08:53',
});
