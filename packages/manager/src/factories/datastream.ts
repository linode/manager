import { destinationType, type Stream, streamType } from '@linode/api-v4';
import { Factory } from '@linode/utilities';

import type { Destination } from '@linode/api-v4';

export const destinationFactory = Factory.Sync.makeFactory<Destination>({
  details: {
    access_key_id: 'Access Id',
    access_key_secret: 'Access Secret',
    bucket_name: 'Bucket Name',
    host: '3000',
    path: 'file',
    region: 'us-ord',
  },
  id: Factory.each((id) => id),
  label: Factory.each((id) => `Destination ${id}`),
  type: destinationType.LinodeObjectStorage,
});

export const streamFactory = Factory.Sync.makeFactory<Stream>({
  created_by: 'username',
  destinations: [destinationFactory.build({ id: 1, label: 'Destination 1' })],
  details: {},
  updated: '2025-07-30',
  updated_by: 'username',
  id: Factory.each((id) => id),
  label: Factory.each((id) => `Data Stream ${id}`),
  primary_destination_id: 1,
  status: 'active',
  stream_audit_id: 1,
  type: streamType.AuditLogs,
  version: '1.0',
  created: '2025-07-30',
});
