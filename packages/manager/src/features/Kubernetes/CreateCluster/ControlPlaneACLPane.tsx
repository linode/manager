import { FormLabel } from '@mui/material';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Notice } from 'src/components/Notice/Notice';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import { validateIPs } from 'src/utilities/ipUtils';

import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface ControlPlaneACLProps {
  enableControlPlaneACL: boolean;
  errorText: string | undefined;
  handleIPv4Change: (ips: ExtendedIP[]) => void;
  handleIPv6Change: (ips: ExtendedIP[]) => void;
  ipV4Addr: ExtendedIP[];
  ipV6Addr: ExtendedIP[];
  setControlPlaneACL: (enabled: boolean) => void;
}

export const ControlPlaneACLPane = (props: ControlPlaneACLProps) => {
  const {
    enableControlPlaneACL,
    errorText,
    handleIPv4Change,
    handleIPv6Change,
    ipV4Addr,
    ipV6Addr,
    setControlPlaneACL,
  } = props;

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
          addresses and ranges specified by you can connect to the control
          plane.
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
          <MultipleIPInput
            onBlur={(_ips: ExtendedIP[]) => {
              const validatedIPs = validateIPs(_ips, {
                allowEmptyAddress: true,
                errorMessage: 'Must be a valid IPv4 address.',
              });
              handleIPv4Change(validatedIPs);
            }}
            buttonText="Add IPv4 Address"
            ips={ipV4Addr}
            isLinkStyled
            onChange={handleIPv4Change}
            placeholder="0.0.0.0/0"
            title="IPv4 Addresses or CIDRs"
          />
          <Box marginTop={2}>
            <MultipleIPInput
              onBlur={(_ips: ExtendedIP[]) => {
                const validatedIPs = validateIPs(_ips, {
                  allowEmptyAddress: true,
                  errorMessage: 'Must be a valid IPv6 address.',
                });
                handleIPv6Change(validatedIPs);
              }}
              buttonText="Add IPv6 Address"
              ips={ipV6Addr}
              isLinkStyled
              onChange={handleIPv6Change}
              placeholder="::/0"
              title="IPv6 Addresses or CIDRs"
            />
          </Box>
        </Box>
      )}
    </>
  );
};
