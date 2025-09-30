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
    host: 'e2e-tests.pl-labkrk2-1.devcloud.linodeobjects.com',
    bucket_name: 'e2e-tests',
    region: 'pl-labkrk-2',
    access_key_id: 'CL1YOXP2A264NO4QHNPV',
    access_key_secret: 'C11um45dx8cajdN5EXHgnVeeMILPGa6KXCNBwSdh',
    path: '/',
  },
};

export const mockDestination: Destination = destinationFactory.build({
  id: 1290,
  ...mockDestinationPayload,
  version: '1.0',
});

// Destination configuration with erroneous data to test destination create/edit.
export const incorrectDestinationData: Destination = {
  ...mockDestination,
  type: 'linode_object_storage',
  details: {
    ...mockDestination.details,
    host: randomString(),
    bucket_name: randomString(),
    access_key_id: randomString(),
    access_key_secret: randomString(),
    path: '',
  },
};

// Destination configuration with correct data to test edit.
export const updatedDestinationData: Destination = {
  ...mockDestination,
  label: randomLabel(),
  details: {
    ...mockDestination.details,
    path: '',
  },
};
