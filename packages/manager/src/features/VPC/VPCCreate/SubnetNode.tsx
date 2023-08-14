import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { Divider } from 'src/components/Divider';
import { SubnetFieldState } from 'src/utilities/subnets';
import { FormHelperText } from 'src/components/FormHelperText';
import { determineIPType } from '@linode/validation';
import { calculateAvailableIpv4s, SubnetIpType } from 'src/utilities/subnets';

interface Props {
  disabled?: boolean;
  idx?: number;
  // janky solution to enable SubnetNode to work on its own or be part of MultipleSubnetInput
  onChange: (subnet: SubnetFieldState, subnetIdx?: number) => void;
  subnet: SubnetFieldState;
}

const RESERVED_IP_NUMBER = 4;

export const SubnetNode = (props: Props) => {
  const theme = useTheme();
  const { disabled, idx, onChange, subnet } = props;
  const [ipType, setIpType] = React.useState<SubnetIpType | undefined>(
    undefined
  );
  const [availIps, setAvailIps] = React.useState<number | undefined>(undefined);

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = { ...subnet, label: e.target.value };
    onChange(newSubnet, idx);
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
    onChange(newSubnet, idx);
  };

  return (
    <Grid key={idx}>
      {idx !== 0 && <Divider sx={{ marginTop: theme.spacing(3) }} />}
      <Box sx={{ width: 416 }}>
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
        {ipType === 'ipv4' && availIps && (
          <FormHelperText>
            Available IP Addresses:{' '}
            {availIps > 4 ? availIps - RESERVED_IP_NUMBER : 0}
          </FormHelperText>
        )}
      </Box>
    </Grid>
  );
};
