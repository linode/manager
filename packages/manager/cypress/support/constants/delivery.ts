import { destinationType, streamType } from '@linode/api-v4';
import { randomLabel, randomString } from 'support/util/random';

import { destinationFactory, streamFactory } from 'src/factories';

import type {
  CreateDestinationPayload,
  CreateStreamPayload,
  Destination,
  Stream,
} from '@linode/api-v4';

export const mockDestinationPayload: CreateDestinationPayload = {
  label: randomLabel(),
  type: destinationType.AkamaiObjectStorage,
  details: {
    host: randomString(),
    bucket_name: randomLabel(),
    access_key_id: randomString(),
    access_key_secret: randomString(),
    path: '/',
  },
};

export const mockDestination: Destination = destinationFactory.build({
  id: 1290,
  ...mockDestinationPayload,
  version: '1.0',
});

export const mockDestinationPayloadWithId = {
  id: mockDestination.id,
  ...mockDestinationPayload,
};

export const mockAuditLogsStreamPayload: CreateStreamPayload = {
  label: randomLabel(),
  type: streamType.AuditLogs,
  destinations: [mockDestination.id],
  details: null,
};

export const mockAuditLogsStream: Stream = streamFactory.build({
  ...mockAuditLogsStreamPayload,
  id: 122,
  destinations: [mockDestination],
  version: '1.0',
});

export const mockLKEAuditLogsStreamPayload: CreateStreamPayload = {
  label: randomLabel(),
  type: streamType.LKEAuditLogs,
  destinations: [mockDestination.id],
  details: {
    cluster_ids: [1, 3],
  },
};

export const mockLKEAuditLogsStream: Stream = streamFactory.build({
  ...mockLKEAuditLogsStreamPayload,
  id: 123,
  destinations: [mockDestination],
  version: '1.0',
});
