import Close from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { FormHelperText } from 'src/components/FormHelperText';
import { TextField } from 'src/components/TextField';
import {
  calculateAvailableIPv4s,
  SubnetFieldState,
  RESERVED_IP_NUMBER,
} from 'src/utilities/subnets';

interface Props {
  disabled?: boolean;
  // extra props enable SubnetNode to be an independent component or be part of MultipleSubnetInput
  // potential refactor - isRemoveable, and subnetIdx & remove in onChange prop
  idx?: number;
  isRemovable?: boolean;
  onChange: (
    subnet: SubnetFieldState,
    subnetIdx?: number,
    remove?: boolean
  ) => void;
  subnet: SubnetFieldState;
}

// TODO: VPC - currently only supports IPv4, must update when/if IPv6 is also supported
export const SubnetNode = (props: Props) => {
  const { disabled, idx, isRemovable, onChange, subnet } = props;

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubnet = {
      ...subnet,
      label: e.target.value,
      labelError: '',
    };
    onChange(newSubnet, idx);
  };

  const onIpv4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const availIPs = calculateAvailableIPv4s(e.target.value);
    const newSubnet = {
      ...subnet,
      ip: { availIPv4s: availIPs, ipv4: e.target.value },
    };
    onChange(newSubnet, idx);
  };

  const removeSubnet = () => {
    onChange(subnet, idx, isRemovable);
  };

  return (
    <Grid key={idx} sx={{ maxWidth: 460 }}>
      <Grid container direction="row" spacing={2}>
        <Grid
          xs={isRemovable ? 11 : 12}
          sx={{ ...(!isRemovable && { width: '100%' }) }}
        >
          <TextField
            disabled={disabled}
            errorText={subnet.labelError}
            inputId={`subnet-label-${idx}`}
            label="Subnet label"
            onChange={onLabelChange}
            placeholder="Enter a subnet label"
            value={subnet.label}
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
          errorText={subnet.ip.ipv4Error}
          inputId={`subnet-ipv4-${idx}`}
          label="Subnet IP Address Range"
          onChange={onIpv4Change}
          value={subnet.ip.ipv4}
        />
        {subnet.ip.availIPv4s && (
          <FormHelperText>
            Number of Available IP Addresses:{' '}
            {subnet.ip.availIPv4s > 4
              ? subnet.ip.availIPv4s - RESERVED_IP_NUMBER
              : 0}
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
