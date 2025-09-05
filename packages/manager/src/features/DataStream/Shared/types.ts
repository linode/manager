import { destinationType, streamStatus, streamType } from '@linode/api-v4';

import type {
  CreateDestinationPayload,
  UpdateDestinationPayload,
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
    value: destinationType.LinodeObjectStorage,
    label: 'Linode Object Storage',
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
    label: 'Enabled',
  },
  {
    value: streamStatus.Inactive,
    label: 'Disabled',
  },
];

export type DestinationFormType =
  | CreateDestinationPayload
  | UpdateDestinationPayload;
