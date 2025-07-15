export const destinationType = {
  CustomHttps: 'custom_https',
  LinodeObjectStorage: 'linode_object_storage',
} as const;

export type DestinationType =
  (typeof destinationType)[keyof typeof destinationType];

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

export interface LinodeObjectStorageDetails {
  access_key_id: string;
  access_key_secret: string;
  bucket_name: string;
  host: string;
  path: string;
  region: string;
}

export type DestinationDetails = LinodeObjectStorageDetails; // Later a CustomHTTPsDetails type will be added

export interface CreateDestinationForm extends DestinationDetails {
  destination_label: string;
  destination_type: DestinationType;
}
