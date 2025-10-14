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
  },
  id: Factory.each((id) => id),
  label: Factory.each((id) => `Destination ${id}`),
  type: destinationType.AkamaiObjectStorage,
  version: '1.0',
  updated: '2025-07-30',
  updated_by: 'username',
  created: '2025-07-30',
  created_by: 'username',
});

export const streamFactory = Factory.Sync.makeFactory<Stream>({
  created_by: 'username',
  destinations: Factory.each(() => [
    { ...destinationFactory.build(), id: 123 },
  ]),
  details: null,
  updated: '2025-07-30',
  updated_by: 'username',
  id: Factory.each((id) => id),
  label: Factory.each((id) => `Stream ${id}`),
  primary_destination_id: 1,
  status: 'active',
  stream_audit_id: 1,
  type: streamType.AuditLogs,
  version: '1.0',
  created: '2025-07-30',
});
