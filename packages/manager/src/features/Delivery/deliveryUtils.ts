import {
  type Destination,
  type DestinationDetailsPayload,
  destinationType,
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
  authenticationTypeOptions,
  contentTypeOptions,
  destinationTypeOptions,
  streamTypeOptions,
} from 'src/features/Delivery/Shared/types';
import { useFlags } from 'src/hooks/useFlags';

import type {
  CustomHTTPSDetailsExtended,
  DestinationType,
} from '@linode/api-v4';
import type {
  AutocompleteOption,
  DestinationDetailsForm,
  FormMode,
} from 'src/features/Delivery/Shared/types';

/**
 * Hook to determine if the ACLP Logs feature is enabled for the current user.

 * @returns {{ isACLPLogsEnabled: boolean, isACLPLogsBeta: boolean, isACLPLogsNew: boolean, isACLPLogsCustomHttpsEnabled: boolean }}
 */
export const useIsACLPLogsEnabled = (): {
  isACLPLogsBeta: boolean;
  isACLPLogsCustomHttpsEnabled: boolean;
  isACLPLogsEnabled: boolean;
  isACLPLogsNew: boolean;
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
    isACLPLogsCustomHttpsEnabled: !!flags.aclpLogs?.customHttpsEnabled,
    isACLPLogsNew: !!flags.aclpLogs?.new,
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

export const getAuthenticationTypeOption = (
  authenticationTypeValue: string
): AutocompleteOption | undefined =>
  authenticationTypeOptions.find(
    ({ value }) => value === authenticationTypeValue
  );

export const getContentTypeOption = (
  contentTypeValue: string
): AutocompleteOption | undefined =>
  contentTypeOptions.find(({ value }) => value === contentTypeValue);

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
  details: DestinationDetailsForm,
  type: DestinationType
): DestinationDetailsPayload => {
  if (type === destinationType.CustomHttps) {
    const propsToRemove: any[] = [];
    const customHTTPSDetails = details as CustomHTTPSDetailsExtended;

    if (!customHTTPSDetails.content_type) {
      propsToRemove.push('content_type');
    }

    if (customHTTPSDetails.client_certificate_details) {
      const certDetails = customHTTPSDetails.client_certificate_details;
      const shouldRemoveCertDetails = [
        certDetails.client_ca_certificate,
        certDetails.client_certificate,
        certDetails.client_private_key,
      ].some((val) => !val);

      if (shouldRemoveCertDetails) {
        propsToRemove.push('client_certificate_details');
      }
    }

    if (propsToRemove.length > 0) {
      return omitProps(
        customHTTPSDetails,
        propsToRemove
      ) as CustomHTTPSDetailsExtended;
    }
  } else if ('path' in details && details.path === '') {
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

export const useIsLkeEAuditLogsTypeSelectionEnabled = (): boolean => {
  const { data: account } = useAccount();
  return !!account?.capabilities?.includes(
    'Akamai Cloud Pulse Logs LKE-E Audit'
  );
};
