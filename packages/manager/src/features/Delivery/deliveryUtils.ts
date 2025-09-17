import {
  type Destination,
  type DestinationDetailsPayload,
  isEmpty,
  type Stream,
  type StreamDetailsType,
  type StreamType,
  streamType,
} from '@linode/api-v4';
import { omitProps } from '@linode/ui';

import {
  destinationTypeOptions,
  streamTypeOptions,
} from 'src/features/Delivery/Shared/types';

import type {
  AutocompleteOption,
  DestinationDetailsForm,
  FormMode,
} from 'src/features/Delivery/Shared/types';

export const getDestinationTypeOption = (
  destinationTypeValue: string
): AutocompleteOption | undefined =>
  destinationTypeOptions.find(({ value }) => value === destinationTypeValue);

export const getStreamTypeOption = (
  streamTypeValue: string
): AutocompleteOption | undefined =>
  streamTypeOptions.find(({ value }) => value === streamTypeValue);

export const isFormInEditMode = (mode: FormMode) => mode === 'edit';

export const getStreamPayloadDetails = (
  type: StreamType,
  details: StreamDetailsType
): StreamDetailsType => {
  if (!details) {
    return null;
  }

  if (!isEmpty(details) && type === streamType.LKEAuditLogs) {
    if (details.is_auto_add_all_clusters_enabled) {
      return omitProps(details, ['cluster_ids']);
    } else {
      return omitProps(details, ['is_auto_add_all_clusters_enabled']);
    }
  }

  return null;
};

export const getDestinationPayloadDetails = (
  details: DestinationDetailsForm
): DestinationDetailsPayload => {
  if ('path' in details && details.path === '') {
    return omitProps(details, ['path']);
  }

  return details;
};

export const getStreamDescription = (stream: Stream) => {
  return `${getStreamTypeOption(stream.type)?.label}`;
};

export const getDestinationDescription = (destination: Destination) => {
  return `${getDestinationTypeOption(destination.type)?.label}`;
};
