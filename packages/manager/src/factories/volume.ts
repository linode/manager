import * as Factory from 'factory.ts';
import { Volume, VolumeRequestPayload } from '@linode/api-v4/lib/volumes/types';

export const volumeFactory = Factory.Sync.makeFactory<Volume>({
  id: Factory.each((id) => id),
  size: 20,
  label: Factory.each((id) => `volume-${id}`),
  region: 'us-east',
  tags: [],
  status: 'active',
  created: '2018-01-01',
  updated: '2019-01-01',
  filesystem_path: '/mnt',
  linode_id: null,
  hardware_type: 'hdd',
});

export const volumeRequestPayloadFactory = Factory.Sync.makeFactory<VolumeRequestPayload>(
  {
    label: Factory.each((id) => `volume-${id}`),
    size: 20,
    region: 'us-east',
  }
);
