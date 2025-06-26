import { Factory } from '@linode/utilities';

import type {
  CloudNAT,
  CreateCloudNATPayload,
  UpdateCloudNATPayload,
} from '@linode/api-v4/lib/networking/types';

export const cloudNATFactory = Factory.Sync.makeFactory<CloudNAT>({
  id: Factory.each((id) => id),
  label: Factory.each((id) => `cloud-nat-mock-${id}`),
  region: 'us-east',
  addresses: Factory.each((id) => [{ address: `203.0.113.${id}` }]),
  port_prefix_default_len: 1024,
});

export const createCloudNATPayloadFactory =
  Factory.Sync.makeFactory<CreateCloudNATPayload>({
    label: Factory.each((id) => `cloud-nat-mock-${id}`),
    region: 'us-east',
  });

export const updateCloudNATPayloadFactory =
  Factory.Sync.makeFactory<UpdateCloudNATPayload>({
    label: Factory.each((id) => `updated-cloud-nat-mock-${id}`),
  });
