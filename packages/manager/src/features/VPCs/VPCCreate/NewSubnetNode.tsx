import { FormHelperText } from '@linode/ui';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { TextField } from 'src/components/TextField';
import {
  RESERVED_IP_NUMBER,
  calculateAvailableIPv4sRFC1918,
} from 'src/utilities/subnets';

import type { CreateSubnetPayload } from '@linode/api-v4';

export interface NewSubnetNodeProps {
  disabled?: boolean;
  ipError: string | undefined;
  labelError: string | undefined;
  onChange: (subnet: CreateSubnetPayload) => void;
  subnet: CreateSubnetPayload;
}

// @TODO VPC: currently only supports IPv4, must update when/if IPv6 is also supported
export const NewSubnetNode = (props: NewSubnetNodeProps) => {
  const { disabled, ipError, labelError, onChange, subnet } = props;

  const availIPs = calculateAvailableIPv4sRFC1918(subnet.ipv4 ?? '');

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = {
      ...subnet,
      label: e.target.value,
    };
    onChange(newSubnet);
  };

  const onIpv4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = {
      ...subnet,
      ipv4: e.target.value,
    };
    onChange(newSubnet);
  };

  return (
    <Grid sx={{ flexGrow: 1, maxWidth: 460 }}>
      <Stack>
        <TextField
          aria-label="Enter a subnet label"
          disabled={disabled}
          errorText={labelError}
          label="Subnet Label"
          onChange={onLabelChange}
          placeholder="Enter a subnet label"
          value={subnet.label}
        />
        <TextField
          aria-label="Enter an IPv4"
          disabled={disabled}
          errorText={ipError}
          label="Subnet IP Address Range"
          onChange={onIpv4Change}
          value={subnet.ipv4}
        />
        {availIPs && (
          <FormHelperText>
            Number of Available IP Addresses:{' '}
            {availIPs > RESERVED_IP_NUMBER
              ? (availIPs - RESERVED_IP_NUMBER).toLocaleString()
              : 0}
          </FormHelperText>
        )}
      </Stack>
    </Grid>
  );
};
