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
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { LinkButton } from 'src/components/LinkButton';
import { stringToExtendedIP, validateIPs } from 'src/utilities/ipUtils';

import type { RenderGuardProps } from 'src/components/RenderGuard';
export interface ControlPlaneACLProps extends RenderGuardProps {
  enableControlPlaneACL: boolean;
  errorText: string | undefined;
  handleIPv4Change: (ips: string[]) => void;
  handleIPv6Change: (ips: string[]) => void;
  setControlPlaneACL: (enabled: boolean) => void;
}

export const ControlPlaneACLPane = (props: ControlPlaneACLProps) => {
  const {
    enableControlPlaneACL,
    errorText,
    handleIPv4Change,
    handleIPv6Change,
    setControlPlaneACL,
  } = props;

  const { clearErrors, control, setError, watch } = useFormContext();
  const {
    append: appendIPv4,
    fields: ipv4Fields,
    remove: removeIPv4,
  } = useFieldArray({
    control,
    name: 'ipv4Addresses',
  });

  const {
    append: appendIPv6,
    fields: ipv6Fields,
    remove: removeIPv6,
  } = useFieldArray({
    control,
    name: 'ipv6Addresses',
  });

  const ipv4Addresses = watch('ipv4Addresses');
  const ipv6Addresses = watch('ipv6Addresses');

  React.useEffect(() => {
    if (ipv4Addresses && ipv4Addresses.length) {
      handleIPv4Change(ipv4Addresses);
    }
  }, [ipv4Addresses, handleIPv4Change]);

  React.useEffect(() => {
    if (ipv6Addresses && ipv6Addresses.length) {
      handleIPv6Change(ipv6Addresses);
    }
  }, [ipv6Addresses, handleIPv6Change]);

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
            {ipv4Fields.map((field, index) => (
              <Stack
                alignItems="flex-start"
                direction="row"
                key={field.id}
                spacing={0.5}
                sx={{ marginBottom: 1 }}
              >
                <Controller
                  render={({ field: controllerField, fieldState }) => (
                    <TextField
                      {...controllerField}
                      onBlur={() => {
                        const _ips = stringToExtendedIP(controllerField?.value);
                        const validatedIPs = validateIPs([_ips], {
                          allowEmptyAddress: true,
                          errorMessage: 'Must be a valid IPv4 address.',
                        });
                        if (validatedIPs[0].error) {
                          setError(controllerField.name, {
                            message: validatedIPs[0].error,
                            type: 'manual',
                          });
                        } else {
                          clearErrors(controllerField.name);
                        }
                      }}
                      data-testid={`ipv4-addresses-or-cidrs-ip-address-${index}`}
                      error={!!fieldState.error}
                      errorText={fieldState.error?.message}
                      hideLabel
                      label={`IPv4 Addresses or CIDRs ip-address-${index}`}
                      ref={null}
                      sx={{ minWidth: 350 }}
                      value={''}
                    />
                  )}
                  control={control}
                  name={`ipv4Addresses[${index}]`}
                />
                {index > 0 && (
                  <IconButton
                    aria-label={`Remove IPv4 Address ${index}`}
                    onClick={() => removeIPv4(index)}
                    sx={{ padding: 0.75 }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Stack>
            ))}
            <LinkButton onClick={() => appendIPv4(' ')}>
              Add IPv4 Address
            </LinkButton>
          </Box>

          {/* IPv6 Addresses */}
          <Box marginTop={2}>
            <Typography mb={1} variant="inherit">
              IPv6 Addresses or CIDRs
            </Typography>
            {ipv6Fields.map((field, index) => (
              <Stack
                alignItems="flex-start"
                direction="row"
                key={field.id}
                spacing={0.5}
                sx={{ marginBottom: 1 }}
              >
                <Controller
                  render={({ field: controllerField, fieldState }) => (
                    <TextField
                      {...controllerField}
                      onBlur={() => {
                        const _ips = stringToExtendedIP(controllerField?.value);
                        const validatedIPs = validateIPs([_ips], {
                          allowEmptyAddress: true,
                          errorMessage: 'Must be a valid IPv6 address.',
                        });
                        if (validatedIPs[0].error) {
                          setError(controllerField.name, {
                            message: validatedIPs[0].error,
                            type: 'manual',
                          });
                        } else {
                          clearErrors(controllerField.name);
                        }
                      }}
                      data-testid={`ipv6-addresses-or-cidrs-ip-address-${index}`}
                      error={!!fieldState.error}
                      errorText={fieldState.error?.message}
                      hideLabel
                      label={`IPv6 Addresses or CIDRs ip-address-${index}`}
                      ref={null}
                      sx={{ minWidth: 350 }}
                      value={''}
                    />
                  )}
                  control={control}
                  name={`ipv6Addresses[${index}]`}
                />
                {index > 0 && (
                  <IconButton
                    aria-label={`Remove IPv6 Address ${index}`}
                    onClick={() => removeIPv6(index)}
                    sx={{ padding: 0.75 }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Stack>
            ))}
            <LinkButton onClick={() => appendIPv6(' ')}>
              Add IPv6 Address
            </LinkButton>
          </Box>
        </Box>
      )}
    </>
  );
};
