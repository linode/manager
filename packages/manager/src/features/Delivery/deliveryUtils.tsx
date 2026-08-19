import { capitalize } from '@akamai/compute-ui-core/formatting';
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
 * Hook to determine if the features in ACLP Logs feature are enabled for the current user.
 */
export const useACLPLogsFlags = (): {
  isACLPLogsBearerTokenAuthEnabled: boolean;
  isACLPLogsNew: boolean;
  isPrivateKeyPassphraseEnabled: boolean;
} => {
  const flags = useFlags();

  return {
    isACLPLogsBearerTokenAuthEnabled: !!flags.aclpLogs?.bearerTokenAuthEnabled,
    isACLPLogsNew: !!flags.aclpLogs?.new,
    isPrivateKeyPassphraseEnabled:
      !!flags.aclpLogs?.privateKeyPassphraseEnabled,
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
      } else {
        const clientCertDetailsPropsToRemove: any[] = [];
        if (!certDetails.tls_hostname?.trim()) {
          clientCertDetailsPropsToRemove.push('tls_hostname');
        }
        if (!certDetails.client_private_key_passphrase?.trim()) {
          clientCertDetailsPropsToRemove.push('client_private_key_passphrase');
        }

        if (clientCertDetailsPropsToRemove.length > 0) {
          finalCustomHTTPSDetails = {
            ...customHTTPSDetails,
            client_certificate_details: omitProps(
              certDetails,
              clientCertDetailsPropsToRemove
            ),
          };
        }
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
