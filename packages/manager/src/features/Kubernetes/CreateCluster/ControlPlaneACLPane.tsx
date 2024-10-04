import { Box, FormLabel } from '@mui/material';
import * as React from 'react';

import { FormControl } from 'src/components/FormControl';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import { validateIPs } from 'src/utilities/ipUtils';

import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface ControlPlaneACLProps {
  enableControlPlaneACL: boolean;
  handleIPv4Change: (ips: ExtendedIP[]) => void;
  handleIPv6Change: (ips: ExtendedIP[]) => void;
  ipV4Addr: ExtendedIP[];
  ipV6Addr: ExtendedIP[];
  setControlPlaneACL: (enabled: boolean) => void;
}

export const IPACLCopy = () => (
  <Typography>
    This is the text for Control Plane Access Control.{' '}
    <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
      Learn more.
    </Link>
  </Typography>
);

export const ControlPlaneACLPane = (props: ControlPlaneACLProps) => {
  const {
    enableControlPlaneACL,
    handleIPv4Change,
    handleIPv6Change,
    ipV4Addr,
    ipV6Addr,
    setControlPlaneACL,
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setControlPlaneACL(!enableControlPlaneACL);
  };

  const handleIPv4ChangeCB = React.useCallback(
    (_ips: ExtendedIP[]) => {
      handleIPv4Change(_ips);
    },
    [handleIPv4Change]
  );

  const handleIPv6ChangeCB = React.useCallback(
    (_ips: ExtendedIP[]) => {
      handleIPv6Change(_ips);
    },
    [handleIPv6Change]
  );

  return (
    <>
      <FormControl data-testid="control-plane-ipacl-form">
        <FormLabel id="ipacl-radio-buttons-group-label">
          <Typography variant="inherit">
            Control Plane Access Control (IPACL)
          </Typography>
        </FormLabel>
        <Typography mb={1}>
          This is the text for Control Plane Access Control.{' '}
          <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
            Learn more.
          </Link>
        </Typography>
        <FormControlLabel
          control={
            <Toggle
              checked={enableControlPlaneACL}
              name="ipacl-checkbox"
              onChange={(e) => handleChange(e)}
            />
          }
          label="Enable IPACL"
        />
      </FormControl>
      {enableControlPlaneACL && (
        <Box sx={{ marginBottom: 3, maxWidth: 450 }}>
          <MultipleIPInput
            onBlur={(_ips: ExtendedIP[]) => {
              const validatedIPs = validateIPs(_ips, {
                allowEmptyAddress: false,
                errorMessage: 'Must be a valid IPv4 address.',
              });
              handleIPv4ChangeCB(validatedIPs);
            }}
            buttonText="Add IPv4 Address"
            ips={ipV4Addr}
            isLinkStyled
            onChange={handleIPv4ChangeCB}
            placeholder="0.0.0.0/0"
            title="IPv4 Addresses or CIDRs"
          />
          <Box marginTop={2}>
            <MultipleIPInput
              onBlur={(_ips: ExtendedIP[]) => {
                const validatedIPs = validateIPs(_ips, {
                  allowEmptyAddress: false,
                  errorMessage: 'Must be a valid IPv6 address.',
                });
                handleIPv6ChangeCB(validatedIPs);
              }}
              buttonText="Add IPv6 Address"
              ips={ipV6Addr}
              isLinkStyled
              onChange={handleIPv6ChangeCB}
              placeholder="::/0"
              title="IPv6 Addresses or CIDRs"
            />
          </Box>
        </Box>
      )}
    </>
  );
};
