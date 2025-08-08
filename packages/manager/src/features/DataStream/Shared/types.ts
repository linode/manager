import { destinationType } from '@linode/api-v4';

import type { CreateDestinationPayload } from '@linode/api-v4';

export interface DestinationTypeOption {
  label: string;
  value: string;
}

export const destinationTypeOptions: DestinationTypeOption[] = [
  {
    value: destinationType.CustomHttps,
    label: 'Custom HTTPS',
  },
  {
    value: destinationType.LinodeObjectStorage,
    label: 'Linode Object Storage',
  },
];

export type CreateDestinationForm = CreateDestinationPayload;
