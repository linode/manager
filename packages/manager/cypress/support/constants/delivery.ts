import { destinationType } from '@linode/api-v4';
import { randomLabel, randomString } from 'support/util/random';

import { destinationFactory } from 'src/factories';

import type { Destination } from '@linode/api-v4';

export const regions = [
  {
    id: 'pl-labkrk-2',
    label: 'PL, Krakow (pl-labkrk-2)',
  },
];

export const mockDestinationPayload = {
  label: randomLabel(),
  type: destinationType.LinodeObjectStorage,
  details: {
    host: randomString(),
    bucket_name: randomString(),
    region: 'pl-labkrk-2',
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
