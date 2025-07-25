import {
  type DestinationType,
  destinationType,
  type LinodeObjectStorageDetails,
} from '@linode/api-v4';

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

export interface CreateDestinationForm extends LinodeObjectStorageDetails {
  destination_label: string;
  destination_type: DestinationType;
}
