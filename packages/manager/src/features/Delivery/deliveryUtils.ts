import {
  type Destination,
  type DestinationDetailsPayload,
  isEmpty,
  type Stream,
  type StreamDetailsType,
  type StreamType,
  streamType,
} from '@linode/api-v4';
import { useAccount } from '@linode/queries';
import { omitProps } from '@linode/ui';
import { isFeatureEnabledV2 } from '@linode/utilities';

import {
  destinationTypeOptions,
  streamTypeOptions,
} from 'src/features/Delivery/Shared/types';
import { useFlags } from 'src/hooks/useFlags';

import type {
  AutocompleteOption,
  DestinationDetailsForm,
  FormMode,
} from 'src/features/Delivery/Shared/types';

/**
 * Hook to determine if the ACLP Logs feature is enabled for the current user.

 * @returns {{ isACLPLogsEnabled: boolean, isACLPLogsBeta: boolean }} An object indicating if the feature is enabled and if it is in beta.
 */
export const useIsACLPLogsEnabled = (): {
  isACLPLogsBeta: boolean;
  isACLPLogsEnabled: boolean;
} => {
  const { data: account } = useAccount();
  const flags = useFlags();

  const isACLPLogsEnabled =
    (flags.aclpLogs?.enabled && flags.aclpLogs?.bypassAccountCapabilities) ||
    isFeatureEnabledV2(
      'Akamai Cloud Pulse Logs',
      !!flags.aclpLogs?.enabled,
      account?.capabilities ?? []
    );

  return {
    isACLPLogsBeta: !!flags.aclpLogs?.beta,
    isACLPLogsEnabled,
  };
};

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
