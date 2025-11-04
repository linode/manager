import { destinationType, streamStatus, streamType } from '@linode/api-v4';

import type {
  AkamaiObjectStorageDetailsExtended,
  CreateDestinationPayload,
  CustomHTTPsDetails,
} from '@linode/api-v4';

export type FormMode = 'create' | 'edit';
export type FormType = 'destination' | 'stream';

export interface LabelValueOption {
  label: string;
  value: string;
}

export const destinationTypeOptions: LabelValueOption[] = [
  {
    value: destinationType.CustomHttps,
    label: 'Custom HTTPS',
  },
  {
    value: destinationType.AkamaiObjectStorage,
    label: 'Akamai Object Storage',
  },
];

export const streamTypeOptions: LabelValueOption[] = [
  {
    value: streamType.AuditLogs,
    label: 'Audit Logs',
  },
  {
    value: streamType.LKEAuditLogs,
    label: 'Kubernetes Audit Logs',
  },
];

export const streamStatusOptions: LabelValueOption[] = [
  {
    value: streamStatus.Active,
    label: 'Active',
  },
  {
    value: streamStatus.Inactive,
    label: 'Inactive',
  },
];

export type DestinationDetailsForm =
  | AkamaiObjectStorageDetailsExtended
  | CustomHTTPsDetails;

export interface DestinationForm
  extends Omit<CreateDestinationPayload, 'details'> {
  details: DestinationDetailsForm;
}

export type DestinationFormType = DestinationForm;
