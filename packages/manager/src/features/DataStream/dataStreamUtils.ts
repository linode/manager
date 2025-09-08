import {
  type Destination,
  isEmpty,
  type Stream,
  streamType,
} from '@linode/api-v4';
import { omitProps } from '@linode/ui';

import {
  destinationTypeOptions,
  streamTypeOptions,
} from 'src/features/DataStream/Shared/types';

import type { StreamDetails, StreamType } from '@linode/api-v4';
import type {
  FormMode,
  LabelValueOption,
} from 'src/features/DataStream/Shared/types';

export const getDestinationTypeOption = (
  destinationTypeValue: string
): LabelValueOption | undefined =>
  destinationTypeOptions.find(({ value }) => value === destinationTypeValue);

export const getStreamTypeOption = (
  streamTypeValue: string
): LabelValueOption | undefined =>
  streamTypeOptions.find(({ value }) => value === streamTypeValue);

export const isFormInEditMode = (mode: FormMode) => mode === 'edit';

export const getStreamPayloadDetails = (
  type: StreamType,
  details: StreamDetails
): StreamDetails => {
  let payloadDetails: StreamDetails = {};

  if (!isEmpty(details) && type === streamType.LKEAuditLogs) {
    if (details.is_auto_add_all_clusters_enabled) {
      payloadDetails = omitProps(details, ['cluster_ids']);
    } else {
      payloadDetails = omitProps(details, ['is_auto_add_all_clusters_enabled']);
    }
  }

  return payloadDetails;
};

export const getStreamDescription = (stream: Stream) => {
  return `${getStreamTypeOption(stream.type)?.label}`;
};

export const getDestinationDescription = (destination: Destination) => {
  return `${getDestinationTypeOption(destination.type)?.label}`;
};
