import { Factory } from '@linode/utilities';

import type {
  CloudNAT,
  CreateCloudNATRequest,
  UpdateCloudNATRequest,
} from '@linode/api-v4/lib/networking/types';

export const cloudNATFactory = Factory.Sync.makeFactory<CloudNAT>({
  id: Factory.each((id) => id),
  label: Factory.each((id) => `cloud-nat-mock-${id}`),
  region: 'us-east',
  addresses: Factory.each((id) => [`203.0.113.${id}`]),
  min_ports_per_interface: 1024,
});

export const createCloudNATRequestFactory =
  Factory.Sync.makeFactory<CreateCloudNATRequest>({
    label: Factory.each((id) => `cloud-nat-mock-${id}`),
    region: 'us-east',
  });

export const updateCloudNATRequestFactory =
  Factory.Sync.makeFactory<UpdateCloudNATRequest>({
    label: Factory.each((id) => `updated-cloud-nat-mock-${id}`),
  });
