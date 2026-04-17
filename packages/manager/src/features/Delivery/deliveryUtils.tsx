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
import { Box, omitProps, SelectedIcon } from '@linode/ui';
import { capitalize, isFeatureEnabledV2 } from '@linode/utilities';
import React from 'react';

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
import type { AutocompleteRenderOptionState } from '@mui/material';
import type {
  AutocompleteBooleanOption,
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
  isACLPLogsMetricsEnabled: boolean;
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
    isACLPLogsMetricsEnabled: !!flags.aclpLogs?.metricsEnabled,
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
    let finalCustomHTTPSDetails = customHTTPSDetails;

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
      } else if (!certDetails.tls_hostname?.trim()) {
        finalCustomHTTPSDetails = {
          ...customHTTPSDetails,
          client_certificate_details: omitProps(certDetails, ['tls_hostname']),
        };
      }
    }

    if (propsToRemove.length > 0) {
      return omitProps(
        finalCustomHTTPSDetails,
        propsToRemove
      ) as CustomHTTPSDetailsExtended;
    }

    return finalCustomHTTPSDetails;
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

export const getPendoPageId = (entity: string, mode: FormMode) =>
  `Logs Delivery ${capitalize(entity)}s ${capitalize(mode === 'edit' ? 'summary' : mode)}`;

export const getDestinationFormPendoId = (entity: string, mode: FormMode) =>
  `${getPendoPageId(entity, mode)}${entity === 'destination' ? '' : ' New Destination'}`;

export const mapAutocompleteOptionsWithPendo = (
  options: AutocompleteOption[],
  pendoIds: { [x: string]: any }
) => {
  return options.map((option) => ({
    ...option,
    pendoId: pendoIds[option.value],
  }));
};

export const renderOptionsWithPendo = (
  props: React.JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLLIElement> &
    React.LiHTMLAttributes<HTMLLIElement>,
  option: AutocompleteBooleanOption | AutocompleteOption,
  { selected }: AutocompleteRenderOptionState
): React.JSX.Element => {
  return (
    <li
      {...props}
      data-pendo-id={option.pendoId}
      data-qa-option
      key={props.key}
    >
      <Box
        sx={{
          flexGrow: 1,
        }}
      >
        {option.label}
      </Box>
      <SelectedIcon visible={selected} />
    </li>
  );
};
