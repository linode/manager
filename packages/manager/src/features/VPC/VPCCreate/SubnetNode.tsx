import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';

import Close from '@mui/icons-material/Close';
import { Button } from 'src/components/Button/Button';
import { TextField } from 'src/components/TextField';
import { SubnetFieldState } from 'src/utilities/subnets';
import { FormHelperText } from 'src/components/FormHelperText';
import { calculateAvailableIPv4s } from 'src/utilities/subnets';

interface Props {
  disabled?: boolean;
  idx?: number;
  // janky solution to enable SubnetNode to be an independent component or be part of MultipleSubnetInput
  // (not the biggest fan tbh)
  isRemovable?: boolean;
  onChange: (
    subnet: SubnetFieldState,
    subnetIdx?: number,
    remove?: boolean
  ) => void;
  subnet: SubnetFieldState;
}

const RESERVED_IP_NUMBER = 4;

// TODO: VPC - currently only supports IPv4, must update when/if IPv6 is also supported
export const SubnetNode = (props: Props) => {
  const { disabled, idx, onChange, subnet, isRemovable } = props;
  const initialIPAvailability = calculateAvailableIPv4s(subnet.ip.ipv4 ?? '');
  const [availIPs, setAvailIPs] = React.useState<number | undefined>(
    initialIPAvailability
  );

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = {
      ...subnet,
      label: e.target.value,
      labelError: '',
    };
    onChange(newSubnet, idx);
  };

  const onIpv4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = {
      ...subnet,
      ip: { ipv4: e.target.value },
    };
    setAvailIPs(calculateAvailableIPv4s(e.target.value));
    onChange(newSubnet, idx);
  };

  const removeSubnet = () => {
    onChange(subnet, idx, isRemovable);
  };

  return (
    <Grid key={idx} sx={{ maxWidth: 460 }}>
      <Grid direction="row" container spacing={2}>
        <Grid xs={isRemovable ? 11 : 12}>
          <TextField
            disabled={disabled}
            label="Subnet label"
            onChange={onLabelChange}
            value={subnet.label}
            errorText={subnet.labelError}
          />
        </Grid>
        {isRemovable && !!idx && (
          <Grid xs={1}>
            <StyledButton onClick={removeSubnet}>
              <Close data-testid={`delete-subnet-${idx}`} />
            </StyledButton>
          </Grid>
        )}
      </Grid>
      <Grid xs={isRemovable ? 11 : 12}>
        <TextField
          disabled={disabled}
          label="Subnet IP Address Range"
          onChange={onIpv4Change}
          value={subnet.ip.ipv4}
          errorText={subnet.ip.ipv4Error}
        />
        {availIPs && (
          <FormHelperText>
            Available IP Addresses:{' '}
            {availIPs > 4 ? availIPs - RESERVED_IP_NUMBER : 0}
          </FormHelperText>
        )}
      </Grid>
    </Grid>
  );
};

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  '& :hover, & :focus': {
    backgroundColor: theme.color.grey2,
  },
  '& > span': {
    padding: 2,
  },
  color: theme.textColors.tableHeader,
  marginTop: theme.spacing(6),
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
