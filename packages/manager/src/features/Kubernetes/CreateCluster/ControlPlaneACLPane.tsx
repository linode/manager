import { Box, FormLabel } from '@mui/material';
import * as React from 'react';

import { FormControl } from 'src/components/FormControl';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { ExtendedIP, validateIPs } from 'src/utilities/ipUtils';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Toggle } from 'src/components/Toggle/Toggle';
import Stack from '@mui/material/Stack';

export interface ControlPlaneACLProps {
  enableControlPlaneACL: boolean;
  setControlPlaneACL: (enabled: boolean) => void;
  ipV4Addr: ExtendedIP[];
  handleIPv4Change: (ips: ExtendedIP[]) => void;
  ipV6Addr: ExtendedIP[];
  handleIPv6Change: (ips: ExtendedIP[]) => void;
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
    setControlPlaneACL,
    ipV4Addr,
    handleIPv4Change,
    ipV6Addr,
    handleIPv6Change,
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

  const statusStyle = (status: boolean) => {
    switch (status) {
      case false:
        return 'none';
      default:
        return '';
    }
  };

  return (
    <FormControl data-testid="control-plane-ipacl-form">
      <FormLabel
        sx={(theme) => ({
          '&&.MuiFormLabel-root.Mui-focused': {
            color: theme.name === 'dark' ? 'white' : theme.color.black,
          },
        })}
        id="ipacl-radio-buttons-group-label"
      >
        <Typography variant="inherit">
          Control Plane Access Control (IPACL)
        </Typography>
      </FormLabel>
      <IPACLCopy />
      <Box sx={{ marginTop: 2 }}>
        <FormControlLabel
          control={
            <Toggle
              checked={enableControlPlaneACL}
              name="ipacl-checkbox"
              onChange={(e) => handleChange(e)}
            />
          }
          label={'Enable IPACL'}
        />
      </Box>
      <Stack
        sx={{ marginBottom: 4, display: statusStyle(enableControlPlaneACL) }}
      >
        <MultipleIPInput
          buttonText="Add IP Address"
          ips={ipV4Addr}
          onChange={handleIPv4ChangeCB}
          onBlur={(_ips: ExtendedIP[]) => {
            const validatedIPs = validateIPs(_ips, {
              allowEmptyAddress: false,
              errorMessage: 'Must be a valid IPv4 address.',
            });
            handleIPv4ChangeCB(validatedIPs);
          }}
          placeholder="0.0.0.0/0"
          title="IPv4 Addresses or CIDRs"
        />
        <MultipleIPInput
          buttonText="Add IP Address"
          ips={ipV6Addr}
          onChange={handleIPv6ChangeCB}
          onBlur={(_ips: ExtendedIP[]) => {
            const validatedIPs = validateIPs(_ips, {
              allowEmptyAddress: false,
              errorMessage: 'Must be a valid IPv6 address.',
            });
            handleIPv6Change(validatedIPs);
          }}
          placeholder="::/0"
          title="IPv6 Addresses or CIDRs"
        />
      </Stack>
    </FormControl>
  );
};
