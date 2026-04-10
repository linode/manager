import {
  authenticationType,
  dataCompressionType,
  destinationType,
  streamType,
} from '@linode/api-v4';
import { randomLabel, randomString } from 'support/util/random';

import {
  akamaiObjectStorageDestinationFactory,
  customHttpsDestinationFactory,
  streamFactory,
} from 'src/factories';

import type {
  CreateDestinationPayload,
  CreateStreamPayload,
  Destination,
  Stream,
} from '@linode/api-v4';

export const mockAkamaiObjectStorageDestinationPayload: CreateDestinationPayload =
  {
    label: randomLabel(),
    type: destinationType.AkamaiObjectStorage,
    details: {
      host: 'test-bucket-name.host.com',
      bucket_name: 'test-bucket-name',
      access_key_id: randomString(),
      access_key_secret: randomString(),
      path: '/',
    },
  };

export const mockAkamaiObjectStorageDestination: Destination =
  akamaiObjectStorageDestinationFactory.build({
    id: 1290,
    ...mockAkamaiObjectStorageDestinationPayload,
    version: '1.0',
  });

export const mockAkamaiObjectStorageDestinationPayloadWithId = {
  id: mockAkamaiObjectStorageDestination.id,
  ...mockAkamaiObjectStorageDestinationPayload,
};

export const mockCustomHttpsDestinationPayload: CreateDestinationPayload = {
  label: randomLabel(),
  type: destinationType.CustomHttps,
  details: {
    authentication: {
      type: authenticationType.Basic,
      details: {
        basic_authentication_user: randomString(),
        basic_authentication_password: randomString(),
      },
    },
    client_certificate_details: {
      tls_hostname: randomString(),
      client_certificate: randomString(),
      client_ca_certificate: randomString(),
      client_private_key: randomString(),
    },
    data_compression: dataCompressionType.Gzip,
    endpoint_url: 'example-endpoint.com',
    content_type: 'application/json',
    custom_headers: [
      {
        name: 'X-Test',
        value: '1',
      },
    ],
  },
};

export const mockCustomHttpsDestination: Destination =
  customHttpsDestinationFactory.build({
    id: 1291,
    ...mockCustomHttpsDestinationPayload,
    version: '1.0',
  });

export const mockCustomHttpsDestinationPayloadWithId = {
  id: mockCustomHttpsDestination.id,
  ...mockCustomHttpsDestinationPayload,
};

export const mockAuditLogsStreamPayload: CreateStreamPayload = {
  label: randomLabel(),
  type: streamType.AuditLogs,
  destinations: [mockAkamaiObjectStorageDestination.id],
  details: null,
};

export const mockAuditLogsStream: Stream = streamFactory.build({
  ...mockAuditLogsStreamPayload,
  id: 122,
  destinations: [mockAkamaiObjectStorageDestination],
  version: '1.0',
});

export const mockLKEAuditLogsStreamPayload: CreateStreamPayload = {
  label: randomLabel(),
  type: streamType.LKEAuditLogs,
  destinations: [mockAkamaiObjectStorageDestination.id],
  details: {
    cluster_ids: [1, 3],
  },
};

export const mockLKEAuditLogsStream: Stream = streamFactory.build({
  ...mockLKEAuditLogsStreamPayload,
  id: 123,
  destinations: [mockAkamaiObjectStorageDestination],
  version: '1.0',
});

export const CREATE_DESTINATION_ERROR_MESSAGE =
  'Cannot create destination at this time.';

export const CREATE_STREAM_ERROR_MESSAGE =
  'You\u2019ve reached the limit of streams you can create. If you have any questions, please contact support.';
