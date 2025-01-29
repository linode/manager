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
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { LinkButton } from 'src/components/LinkButton';
// import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
// import { validateIPs } from 'src/utilities/ipUtils';

import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface ControlPlaneACLProps {
  enableControlPlaneACL: boolean;
  errorText: string | undefined;
  handleIPv4Change: (ips: ExtendedIP[]) => void;
  handleIPv6Change: (ips: ExtendedIP[]) => void;
  ipV4Addr: string[] | null | undefined;
  ipV6Addr: string[] | null | undefined;
  setControlPlaneACL: (enabled: boolean) => void;
}

export const ControlPlaneACLPane = (props: ControlPlaneACLProps) => {
  const {
    enableControlPlaneACL,
    errorText,
    handleIPv4Change,
    handleIPv6Change,
    // ipV4Addr,
    // ipV6Addr,
    setControlPlaneACL,
  } = props;

  const { control, watch } = useForm();
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

  // Watch for changes to the ipv4Addresses and ipv6Addresses fields
  const ipv4Addresses = watch('ipv4Addresses');
  const ipv6Addresses = watch('ipv6Addresses');

  // Whenever the IP addresses change, call the corresponding handler in the parent
  React.useEffect(() => {
    if (ipv4Addresses && ipv4Addresses.length) {
      handleIPv4Change(ipv4Addresses);
    }
  }, [ipv4Addresses, handleIPv4Change]);

  // Only call handleIPv6Change if the value changes (to avoid re-renders)
  React.useEffect(() => {
    if (ipv6Addresses && ipv6Addresses.length) {
      handleIPv6Change(ipv6Addresses);
    }
  }, [ipv6Addresses, handleIPv6Change]);

  return (
    // <>
    //   <FormControl data-testid="control-plane-ipacl-form">
    //     <FormLabel id="ipacl-radio-buttons-group-label">
    //       <Typography variant="inherit">Control Plane ACL</Typography>
    //     </FormLabel>
    //     {errorText && (
    //       <Notice spacingTop={8} variant="error">
    //         <ErrorMessage message={errorText} />{' '}
    //       </Notice>
    //     )}
    //     <Typography mb={1} sx={{ width: '85%' }}>
    //       Enable an access control list (ACL) on your LKE cluster to restrict
    //       access to your cluster’s control plane. When enabled, only the IP
    //       addresses and ranges you specify can connect to the control plane.
    //     </Typography>
    //     <FormControlLabel
    //       control={
    //         <Toggle
    //           checked={enableControlPlaneACL}
    //           name="ipacl-checkbox"
    //           onChange={() => setControlPlaneACL(!enableControlPlaneACL)}
    //         />
    //       }
    //       label="Enable Control Plane ACL"
    //     />
    //   </FormControl>
    //   {enableControlPlaneACL && (
    //     <Box sx={{ marginBottom: 3, maxWidth: 450 }}>
    //       <MultipleIPInput
    //         onBlur={(_ips: ExtendedIP[]) => {
    //           const validatedIPs = validateIPs(_ips, {
    //             allowEmptyAddress: true,
    //             errorMessage: 'Must be a valid IPv4 address.',
    //           });
    //           handleIPv4Change(validatedIPs);
    //         }}
    //         buttonText="Add IPv4 Address"
    //         ips={ipV4Addr}
    //         isLinkStyled
    //         onChange={handleIPv4Change}
    //         title="IPv4 Addresses or CIDRs"
    //       />
    //       <Box marginTop={2}>
    //         <MultipleIPInput
    //           onBlur={(_ips: ExtendedIP[]) => {
    //             const validatedIPs = validateIPs(_ips, {
    //               allowEmptyAddress: true,
    //               errorMessage: 'Must be a valid IPv6 address.',
    //             });
    //             handleIPv6Change(validatedIPs);
    //           }}
    //           buttonText="Add IPv6 Address"
    //           ips={ipV6Addr}
    //           isLinkStyled
    //           onChange={handleIPv6Change}
    //           title="IPv6 Addresses or CIDRs"
    //         />
    //       </Box>
    //     </Box>
    //   )}
    // </>
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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      hideLabel
                      label={`IPv4 Address ${index + 1}`}
                      onBlur={controllerField.onBlur}
                      placeholder="10.0.0.0/24"
                      sx={{ minWidth: 290 }}
                    />
                  )}
                  control={control}
                  name={`ipv4Addresses[${index}]`}
                />
                <IconButton
                  aria-label={`Remove IPv4 Address ${index}`}
                  onClick={() => removeIPv4(index)}
                  sx={{ padding: 0.75 }}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            ))}
            <LinkButton onClick={() => appendIPv4('')}>
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
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      hideLabel
                      label={`IPv6 Address ${index + 1}`}
                      onBlur={controllerField.onBlur}
                      placeholder="2001:db8::/32"
                      sx={{ minWidth: 290 }}
                    />
                  )}
                  control={control}
                  name={`ipv6Addresses[${index}]`}
                />
                <IconButton
                  aria-label={`Remove IPv6 Address ${index}`}
                  onClick={() => removeIPv6(index)}
                  sx={{ padding: 0.75 }}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            ))}
            <LinkButton onClick={() => appendIPv6('')}>
              Add IPv6 Address
            </LinkButton>
          </Box>
        </Box>
      )}
    </>
  );
};
