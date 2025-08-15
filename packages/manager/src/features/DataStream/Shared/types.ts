import { destinationType, streamType, } from '@linode/api-v4';

import type { CreateDestinationPayload } from '@linode/api-v4';

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

export type CreateDestinationForm = CreateDestinationPayload;
