import { FormLabel } from '@mui/material';
import * as React from 'react';

import { FormControl } from 'src/components/FormControl';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { ExtendedIP, validateIPs } from 'src/utilities/ipUtils';
import { Notice } from 'src/components/Notice/Notice';
import { Checkbox } from 'src/components/Checkbox';
import Stack from '@mui/material/Stack';

export interface ControlPlaneACLProps {
  enableControlPlaneACL: boolean;
  setControlPlaneACL: (enabled: boolean) => void;
  ipV4Addr: ExtendedIP[];
  handleIPv4Change: (ips: ExtendedIP[]) => void;
  ipV6Addr: ExtendedIP[];
  handleIPv6Change: (ips: ExtendedIP[]) => void;
  aclError?: string;
}

export const IPACLCopy = () => (
  <Typography>
    This is the text for Control Plane Access Control.
    <br />
    <Link to="https://www.linode.com/docs/guides/enable-lke-high-availability/">
      Learn more about the control plane access control list
    </Link>
    .
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
    aclError,
  } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setControlPlaneACL(!enableControlPlaneACL);
  };

  const statusStyle = (status: boolean) => {
    switch (status) {
      case false:
        return 'none';
      default:
        return '';
    }
  };

  const [ipV4InputError, setIPV4InputError] = React.useState<
    string | undefined
  >('');
  const [ipV6InputError, setIPV6InputError] = React.useState<
    string | undefined
  >('');

  return (
    <FormControl data-testid="control-plane-ipacl-form">
      {aclError && <Notice text={aclError} variant="error" />}
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
      <Checkbox
        checked={enableControlPlaneACL}
        name="ipacl-checkbox"
        text={'Enable IPACL'}
        onChange={(e) => handleChange(e)}
      />
      <Stack sx={{ display: statusStyle(enableControlPlaneACL) }}>
        <MultipleIPInput
          buttonText="Add IP Address"
          ips={ipV4Addr}
          onChange={(_ips: ExtendedIP[]) => {
            const validatedIPs = validateIPs(_ips, {
              allowEmptyAddress: false,
              errorMessage: 'Must be a valid IPv4 address.',
            });
            const ipsWithErrors = validatedIPs.filter((thisIP) =>
              setIPV4InputError(thisIP.error)
            );
            if (ipsWithErrors.length === 0) {
              handleIPv4Change(validatedIPs);
            }
          }}
          placeholder="0.0.0.0/0"
          title="IPv4 Addresses or CIDR"
          error={ipV4InputError}
        />
        <MultipleIPInput
          buttonText="Add IP Address"
          ips={ipV6Addr}
          onChange={(_ips: ExtendedIP[]) => {
            const validatedIPs = validateIPs(_ips, {
              allowEmptyAddress: false,
              errorMessage: 'Must be a valid IPv6 address.',
            });
            const ipsWithErrors: ExtendedIP[] = validatedIPs.filter((thisIP) =>
              setIPV6InputError(thisIP.error)
            );
            if (ipsWithErrors.length === 0) {
              handleIPv6Change(validatedIPs);
            }
          }}
          placeholder="::/0"
          title="IPv6 Addresses or CIDR"
          error={ipV6InputError}
        />
      </Stack>
    </FormControl>
  );
};
