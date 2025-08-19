import { destinationType, streamStatus } from '@linode/api-v4';

import type { CreateDestinationPayload } from '@linode/api-v4';

export interface DestinationTypeOption {
  label: string;
  value: string;
}

export interface LabelValueOption {
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

export const streamStatusOptions = [
  {
    value: streamStatus.Active,
    label: 'Enabled',
  },
  {
    value: streamStatus.Inactive,
    label: 'Disabled',
  },
];

export type CreateDestinationForm = CreateDestinationPayload;
