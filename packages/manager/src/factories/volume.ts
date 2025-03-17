import { Factory } from '@linode/utilities';

import type {
  Volume,
  VolumeRequestPayload,
} from '@linode/api-v4/lib/volumes/types';

export const volumeFactory = Factory.Sync.makeFactory<Volume>({
  created: '2018-01-01',
  encryption: 'enabled',
  filesystem_path: '/mnt',
  hardware_type: 'nvme',
  id: Factory.each((id) => id),
  label: Factory.each((id) => `volume-${id}`),
  linode_id: null,
  linode_label: null,
  region: 'us-east',
  size: 20,
  status: 'active',
  tags: [],
  updated: '2019-01-01',
});

export const volumeRequestPayloadFactory = Factory.Sync.makeFactory<VolumeRequestPayload>(
  {
    label: Factory.each((id) => `volume-${id}`),
    region: 'us-east',
    size: 20,
  }
);
