import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';

import { TextField } from 'src/components/TextField';
import { Divider } from 'src/components/Divider';
import { SubnetFieldState } from './VPCCreate';
import { FormHelperText } from 'src/components/FormHelperText';
import { determineIPType } from '@linode/validation';

interface Props {
  disabled: boolean;
  idx: number;
  key: string;
  onChange: (subnet: SubnetFieldState) => void;
  subnet: SubnetFieldState;
}

const RESERVED_IP_NUMBER = 4;
type VpcIPType = "ipv4" | "ipv6";

export const SubnetNode = (props: Props) => {
  const { disabled, idx, onChange, subnet } = props;
  const [ipType, setIpType] = React.useState<VpcIPType | undefined>(undefined);
  const [availIps, setAvailIps] = React.useState<number | undefined>(undefined);

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = { ...subnet, label: e.target.value };
    onChange(newSubnet);
  };

  const onIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subnetError = subnet.ip.error ?? '';
    const newSubnet = {
      ...subnet,
      ip: { address: e.target.value, error: subnetError },
    };
    const ipType = determineIPType(e.target.value);
    setIpType(ipType);
    setAvailIps(calculateAvailableIpv4s(e.target.value, ipType));
    onChange(newSubnet);
  };

  return (
    <Grid key={idx}>
      {idx !== 0 && <Divider sx={{ marginTop: '24px' }} />}
      <TextField
        disabled={disabled}
        label="Subnet label"
        onChange={onLabelChange}
        value={subnet.label}
      />
      <TextField
        disabled={disabled}
        label="Subnet IP Range Address"
        onChange={onIpChange}
        value={subnet.ip.address}
        errorText={subnet.ip.error}
      />
      {ipType === 'ipv4' && availIps && <FormHelperText>Available IP Addresses: {availIps > 4 ? availIps - RESERVED_IP_NUMBER : 0}</FormHelperText>}
    </Grid>
    // TODO calculate available ips
  );
};

// worth moving this and below function to a utility file? 
// to get usable IPs, subtract given # by 2 (except for subnet masks of 31 and 32)
// to get availble ips for our VPCs, subtract given # by 4
// are there some subnets that we're not allowing? I forget
const SubnetMaskToAvailIps = {
  0: 4294967296,
  1: 2147483648,
  2: 1073741824,
  3: 536870912,
  4: 268435456,
  5: 134217728,
  6: 67108864,
  7: 33554432,
  8: 16777216,
  9: 8388608,
  10: 4194304,
  11: 2097152,
  12: 1048576,
  13: 524288,
  14: 262144,
  15: 131072,
  16: 65536,
  17: 32768,
  18: 16384,
  19: 8192,
  20: 4096,
  21: 2048,
  22: 1024,
  23: 512,
  24: 256,
  25: 128,
  26: 64,
  27: 32,
  28: 16,
  29: 8,
  30: 4,
  31: 2,
  32: 1
}

const calculateAvailableIpv4s = (address: string, ipType: VpcIPType | undefined): number | undefined => {
  const [, mask] = address.split('/');
  if (ipType !== 'ipv4' || !!!mask) {
    return undefined;
  }

  return SubnetMaskToAvailIps[mask];
}