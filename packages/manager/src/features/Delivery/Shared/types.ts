import {
  authenticationType,
  destinationType,
  streamStatus,
  streamType,
} from '@linode/api-v4';

import type {
  AkamaiObjectStorageDetailsExtended,
  CreateDestinationPayload,
  CustomHTTPSDetails,
} from '@linode/api-v4';

export type FormMode = 'create' | 'edit';
export type FormType = 'destination' | 'stream';

export interface AutocompleteOption {
  label: string;
  pendoId?: string;
  value: string;
}

export const destinationTypeOptions: AutocompleteOption[] = [
  {
    value: destinationType.CustomHttps,
    label: 'Custom HTTPS',
  },
  {
    value: destinationType.AkamaiObjectStorage,
    label: 'Akamai Object Storage',
  },
];

export const streamTypeOptions: AutocompleteOption[] = [
  {
    value: streamType.AuditLogs,
    label: 'Audit Logs',
  },
  {
    value: streamType.LKEAuditLogs,
    label: 'Kubernetes API Audit Logs',
  },
];

export const streamStatusOptions: AutocompleteOption[] = [
  {
    value: streamStatus.Active,
    label: 'Active',
    pendoId: 'Logs Delivery Streams-Status Active',
  },
  {
    value: streamStatus.Inactive,
    label: 'Inactive',
    pendoId: 'Logs Delivery Streams-Status Inactive',
  },
];

export const authenticationTypeOptions: AutocompleteOption[] = [
  {
    value: authenticationType.Basic,
    label: 'Basic',
  },
  {
    value: authenticationType.None,
    label: 'None',
  },
];

export type DestinationDetailsForm =
  | AkamaiObjectStorageDetailsExtended
  | CustomHTTPSDetails;

export interface DestinationForm
  extends Omit<CreateDestinationPayload, 'details'> {
  details: DestinationDetailsForm;
}

export type DestinationFormType = DestinationForm;
