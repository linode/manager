import { isEmpty, streamType } from '@linode/api-v4';
import { omitProps } from '@linode/ui';

import {
  destinationTypeOptions,
  streamTypeOptions,
} from 'src/features/DataStream/Shared/types';

import type { StreamDetails, StreamType } from '@linode/api-v4';
import type { LabelValueOption } from 'src/features/DataStream/Shared/types';
import type { StreamFormMode } from 'src/features/DataStream/Streams/StreamForm/types';

export const getDestinationTypeOption = (
  destinationTypeValue: string
): LabelValueOption | undefined =>
  destinationTypeOptions.find(({ value }) => value === destinationTypeValue);

export const getStreamTypeOption = (
  streamTypeValue: string
): LabelValueOption | undefined =>
  streamTypeOptions.find(({ value }) => value === streamTypeValue);

export const isFormInEditMode = (mode: StreamFormMode) => mode === 'edit';

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
