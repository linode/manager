import { destinationType, type Stream, streamType } from '@linode/api-v4';
import { Factory } from '@linode/utilities';

import type { Destination } from '@linode/api-v4';

let destinationIdCounter = 0;
const nextDestinationId = () => ++destinationIdCounter;

export const akamaiObjectStorageDestinationFactory =
  Factory.Sync.makeFactory<Destination>({
    details: {
      access_key_id: 'Access Id',
      bucket_name: 'destinations-bucket-name',
      host: 'destinations-bucket-name.host.com',
      path: 'file',
    },
    id: Factory.each(() => nextDestinationId()),
    label: Factory.each((id) => `Akamai Object Storage Destination ${id}`),
    type: destinationType.AkamaiObjectStorage,
    version: '1.0',
    updated: '2025-07-30',
    updated_by: 'username',
    created: '2025-07-30',
    created_by: 'username',
  });

export const customHttpsDestinationFactory =
  Factory.Sync.makeFactory<Destination>({
    details: {
      authentication: {
        type: 'none',
      },
      data_compression: 'None',
      endpoint_url: 'https://example.com/endpoint',
      content_type: 'application/json',
      custom_headers: [{ name: 'X-Test', value: '1' }],
    },
    id: Factory.each(() => nextDestinationId()),
    label: Factory.each((id) => `Custom HTTPS Destination ${id}`),
    type: destinationType.CustomHttps,
    version: '1.0',
    updated: '2025-07-30',
    updated_by: 'username',
    created: '2025-07-30',
    created_by: 'username',
  });

export const streamFactory = Factory.Sync.makeFactory<Stream>({
  created_by: 'username',
  destinations: Factory.each(() => [
    { ...akamaiObjectStorageDestinationFactory.build(), id: 123 },
  ]),
  details: null,
  updated: '2025-07-30',
  updated_by: 'username',
  id: Factory.each((id) => id),
  label: Factory.each((id) => `Stream ${id}`),
  status: 'active',
  type: streamType.AuditLogs,
  version: '1.0',
  created: '2025-07-30',
});
