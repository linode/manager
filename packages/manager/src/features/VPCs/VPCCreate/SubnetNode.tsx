import { Button, TextField } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  RESERVED_IP_NUMBER,
  calculateAvailableIPv4sRFC1918,
} from 'src/utilities/subnets';

import type { CreateVPCPayload } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  idx: number;
  isCreateVPCDrawer?: boolean;
  remove: (index?: number | number[]) => void;
}

// @TODO VPC: currently only supports IPv4, must update when/if IPv6 is also supported
export const SubnetNode = (props: Props) => {
  const { disabled, idx, isCreateVPCDrawer, remove } = props;

  const { control } = useFormContext<CreateVPCPayload>();

  const { ipv4, label } = useWatch({ control, name: `subnets.${idx}` });

  const numberOfAvailIPs = calculateAvailableIPv4sRFC1918(ipv4 ?? '');

  const availableIPHelperText = numberOfAvailIPs
    ? `Number of Available IP Addresses: ${
        numberOfAvailIPs > 4
          ? (numberOfAvailIPs - RESERVED_IP_NUMBER).toLocaleString()
          : 0
      }`
    : undefined;

  const showRemoveButton = !(isCreateVPCDrawer && idx === 0);

  return (
    <Grid key={idx} sx={{ maxWidth: 460 }}>
      <Grid container direction="row" spacing={2}>
        <Grid
          sx={{ ...(!showRemoveButton && { width: '100%' }), flexGrow: 1 }}
          size={showRemoveButton ? 11 : 12}
        >
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                aria-label="Enter a subnet label"
                disabled={disabled}
                errorText={fieldState.error?.message}
                inputId={`subnet-label-${idx}`}
                label="Subnet Label"
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder="Enter a subnet label"
                value={field.value}
              />
            )}
            control={control}
            name={`subnets.${idx}.label`}
          />
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                aria-label="Enter an IPv4"
                disabled={disabled}
                errorText={fieldState.error?.message}
                helperText={availableIPHelperText}
                inputId={`subnet-ipv4-${idx}`}
                label="Subnet IP Address Range"
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
            control={control}
            name={`subnets.${idx}.ipv4`}
          />
        </Grid>
        {showRemoveButton && (
          <Grid size={1}>
            <StyledButton
              aria-label={`Remove Subnet ${label !== '' ? label : idx}`}
              onClick={() => remove(idx)}
            >
              <Close data-testid={`delete-subnet-${idx}`} />
            </StyledButton>
          </Grid>
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
