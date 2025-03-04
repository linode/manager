import {
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  Notice,
  Stack,
  TextField,
  Toggle,
  Typography,
} from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { FormLabel } from '@mui/material';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { LinkButton } from 'src/components/LinkButton';
import {
  extendedIPToString,
  stringToExtendedIP,
  validateIPs,
} from 'src/utilities/ipUtils';

import type { CreateKubeClusterPayload } from '@linode/api-v4';
import type { RenderGuardProps } from 'src/components/RenderGuard';
export interface ControlPlaneACLProps extends RenderGuardProps {
  enableControlPlaneACL: boolean;
  errorText: string | undefined;
  initialIpv4Addresses?: string[];
  initialIpv6Addresses?: string[];
  setControlPlaneACL: (enabled: boolean) => void;
}

export const ControlPlaneACLPane = (props: ControlPlaneACLProps) => {
  const { enableControlPlaneACL, errorText, setControlPlaneACL } = props;

  const {
    clearErrors,
    control,
    getValues,
    setError,
    setValue,
    watch,
  } = useFormContext<CreateKubeClusterPayload>();

  const ipv4Addresses = watch('control_plane.acl.addresses.ipv4');
  const ipv6Addresses = watch('control_plane.acl.addresses.ipv6');

  const handleBlur = (value: string, index: number, type: 'ipv4' | 'ipv6') => {
    const _ips = value ? stringToExtendedIP(value) : stringToExtendedIP('');
    const validatedIPs = validateIPs([_ips], {
      allowEmptyAddress: true,
      errorMessage:
        type === 'ipv4'
          ? 'Must be a valid IPv4 address.'
          : 'Must be a valid IPv6 address.',
    });
    if (validatedIPs[0].error) {
      setError(`control_plane.acl.addresses.${type}.${index}`, {
        message: validatedIPs[0].error,
        type: 'manual',
      });
    } else {
      clearErrors(`control_plane.acl.addresses.${type}.${index}`);
    }
    const newIP = extendedIPToString(_ips);
    setValue(`control_plane.acl.addresses.${type}.${index}`, newIP);
  };

  return (
    <>
      <FormControl data-testid="control-plane-ipacl-form">
        <FormLabel id="ipacl-radio-buttons-group-label">
          <Typography variant="inherit">Control Plane ACL</Typography>
        </FormLabel>
        {errorText && (
          <Notice spacingTop={8} variant="error">
            <ErrorMessage message={errorText} />{' '}
          </Notice>
        )}
        <Typography mb={1} sx={{ width: '85%' }}>
          Enable an access control list (ACL) on your LKE cluster to restrict
          access to your cluster’s control plane. When enabled, only the IP
          addresses and ranges you specify can connect to the control plane.
        </Typography>
        <FormControlLabel
          control={
            <Toggle
              checked={enableControlPlaneACL}
              name="ipacl-checkbox"
              onChange={() => setControlPlaneACL(!enableControlPlaneACL)}
            />
          }
          label="Enable Control Plane ACL"
        />
      </FormControl>

      {enableControlPlaneACL && (
        <Box sx={{ marginBottom: 3, maxWidth: 450 }}>
          {/* IPv4 Addresses */}
          <Box marginTop={2}>
            <Typography mb={1} variant="inherit">
              IPv4 Addresses or CIDRs
            </Typography>
            {(getValues('control_plane.acl.addresses.ipv4') || []).map(
              (field: string, index: number) => (
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  key={`ipv4-${index}`}
                  spacing={0.5}
                  sx={{ marginBottom: 1 }}
                >
                  <Controller
                    render={({ field: controllerField, fieldState }) => (
                      <TextField
                        {...controllerField}
                        onBlur={() =>
                          handleBlur(controllerField.value, index, 'ipv4')
                        }
                        data-testid={`ipv4-addresses-or-cidrs-ip-address-${index}`}
                        error={!!fieldState.error}
                        errorText={fieldState.error?.message}
                        hideLabel
                        label={`IPv4 Addresses or CIDRs ip-address-${index}`}
                        ref={null}
                        sx={{ minWidth: 350 }}
                        value={controllerField.value}
                      />
                    )}
                    control={control}
                    name={`control_plane.acl.addresses.ipv4.${index}`}
                  />
                  {index > 0 && (
                    <IconButton
                      onClick={() => {
                        const currentIPv4Addresses =
                          ipv4Addresses?.filter((_, i) => i !== index) || [];
                        setValue(
                          'control_plane.acl.addresses.ipv4',
                          currentIPv4Addresses
                        );
                      }}
                      aria-label={`Remove IPv4 Address ${index}`}
                      sx={{ padding: 0.75 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Stack>
              )
            )}
            <LinkButton
              onClick={() => {
                const newIpv4Addresses = [...(ipv4Addresses || []), ''];
                setValue('control_plane.acl.addresses.ipv4', newIpv4Addresses);
              }}
            >
              Add IPv4 Address
            </LinkButton>
          </Box>

          {/* IPv6 Addresses */}
          <Box marginTop={2}>
            <Typography mb={1} variant="inherit">
              IPv6 Addresses or CIDRs
            </Typography>
            {(getValues('control_plane.acl.addresses.ipv6') || []).map(
              (field: string, index: number) => (
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  key={`ipv6-${index}`}
                  spacing={0.5}
                  sx={{ marginBottom: 1 }}
                >
                  <Controller
                    render={({ field: controllerField, fieldState }) => (
                      <TextField
                        {...controllerField}
                        onBlur={() =>
                          handleBlur(controllerField.value, index, 'ipv6')
                        }
                        data-testid={`ipv6-addresses-or-cidrs-ip-address-${index}`}
                        error={!!fieldState.error}
                        errorText={fieldState.error?.message}
                        hideLabel
                        label={`IPv6 Addresses or CIDRs ip-address-${index}`}
                        ref={null}
                        sx={{ minWidth: 350 }}
                        value={controllerField.value}
                      />
                    )}
                    control={control}
                    name={`control_plane.acl.addresses.ipv6.${index}`}
                  />
                  {index > 0 && (
                    <IconButton
                      onClick={() => {
                        const currentIPv6Addresses =
                          ipv6Addresses?.filter((_, i) => i !== index) || [];
                        setValue(
                          'control_plane.acl.addresses.ipv6',
                          currentIPv6Addresses
                        );
                      }}
                      aria-label={`Remove IPv6 Address ${index}`}
                      sx={{ padding: 0.75 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Stack>
              )
            )}
            <LinkButton
              onClick={() => {
                const newIpv6Addresses = [...(ipv6Addresses || []), ''];
                setValue('control_plane.acl.addresses.ipv6', newIpv6Addresses);
              }}
            >
              Add IPv6 Address
            </LinkButton>
          </Box>
        </Box>
      )}
    </>
  );
};
