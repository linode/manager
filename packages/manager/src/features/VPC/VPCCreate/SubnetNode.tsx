import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';

import { Button } from 'src/components/Button/Button';
import { Box } from 'src/components/Box';
import { TextField } from 'src/components/TextField';
import { Divider } from 'src/components/Divider';
import { SubnetFieldState } from './VPCCreate';
import { FormHelperText } from 'src/components/FormHelperText';
import { determineIPType } from '@linode/validation';
import { calculateAvailableIpv4s, SubnetIpType } from 'src/utilities/subnets';

interface Props {
  disabled: boolean;
  idx: number;
  key: string;
  onChange: (subnet: SubnetFieldState) => void;
  onDelete: (subnetIdx: number) => void;
  subnet: SubnetFieldState;
}

const RESERVED_IP_NUMBER = 4;

export const SubnetNode = (props: Props) => {
  const theme = useTheme();
  const { disabled, idx, onChange, subnet, onDelete } = props;
  const [ipType, setIpType] = React.useState<SubnetIpType | undefined>(
    undefined
  );
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
      {idx !== 0 && <Divider sx={{ marginTop: theme.spacing(3) }} />}
      <Grid container alignItems={'center'}>
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
        <StyledButton onClick={() => onDelete(idx)}>Remove</StyledButton>
      </Grid>
    </Grid>
  );
};

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(1),
    paddingLeft: 0,
  },
}));
