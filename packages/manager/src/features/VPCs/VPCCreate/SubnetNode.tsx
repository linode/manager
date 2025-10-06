import { Button, CloseIcon, Select, TextField } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  calculateAvailableIPv4sRFC1918,
  calculateAvailableIPv6Linodes,
  RESERVED_IP_NUMBER,
  SUBNET_IPV6_PREFIX_LENGTHS,
} from 'src/utilities/subnets';

import type { CreateVPCPayload } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  idx: number;
  isCreateVPCDrawer?: boolean;
  remove: (index?: number | number[]) => void;
  shouldDisplayIPv6?: boolean;
}

export const SubnetNode = (props: Props) => {
  const { disabled, idx, shouldDisplayIPv6, isCreateVPCDrawer, remove } = props;

  const { control } = useFormContext<CreateVPCPayload>();

  const { ipv4, label } = useWatch({ control, name: `subnets.${idx}` });

  const numberOfAvailIPs = calculateAvailableIPv4sRFC1918(ipv4 ?? '');

  const availableIPv4HelperText = numberOfAvailIPs
    ? `Number of Available IP Addresses: ${
        numberOfAvailIPs > 4
          ? (numberOfAvailIPs - RESERVED_IP_NUMBER).toLocaleString()
          : 0
      }`
    : undefined;

  const numberOfAvailableIPv4Linodes =
    numberOfAvailIPs && numberOfAvailIPs > 4
      ? numberOfAvailIPs - RESERVED_IP_NUMBER
      : 0;
  const showRemoveButton = !(isCreateVPCDrawer && idx === 0);

  return (
    <Grid key={idx} sx={{ maxWidth: 460 }}>
      <Grid container direction="row" spacing={2}>
        <Grid
          size={showRemoveButton ? 11 : 12}
          sx={{ ...(!showRemoveButton && { width: '100%' }), flexGrow: 1 }}
        >
          <Controller
            control={control}
            name={`subnets.${idx}.label`}
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
          />
          <Controller
            control={control}
            name={`subnets.${idx}.ipv4`}
            render={({ field, fieldState }) => (
              <TextField
                aria-label="Enter an IPv4"
                disabled={disabled}
                errorText={fieldState.error?.message}
                helperText={!shouldDisplayIPv6 && availableIPv4HelperText}
                inputId={`subnet-ipv4-${idx}`}
                label="Subnet IP Address Range"
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
          {shouldDisplayIPv6 && (
            <Controller
              control={control}
              name={`subnets.${idx}.ipv6.0.range`}
              render={({ field, fieldState }) => (
                <Select
                  errorText={fieldState.error?.message}
                  helperText={`Number of Linodes: ${Math.min(
                    numberOfAvailableIPv4Linodes,
                    calculateAvailableIPv6Linodes(field.value)
                  )}`}
                  label="IPv6 Prefix Length"
                  onChange={(_, option) => field.onChange(option.value)}
                  options={SUBNET_IPV6_PREFIX_LENGTHS}
                  sx={{
                    width: 140,
                  }}
                  value={SUBNET_IPV6_PREFIX_LENGTHS.find(
                    (option) => option.value === field.value
                  )}
                />
              )}
            />
          )}
        </Grid>
        {showRemoveButton && (
          <Grid size={1}>
            <StyledButton
              aria-label={`Remove Subnet ${label !== '' ? label : idx}`}
              disabled={disabled}
              onClick={() => remove(idx)}
            >
              <CloseIcon data-testid={`delete-subnet-${idx}`} />
            </StyledButton>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  '& > span': {
    padding: 2,
  },
  height: 20,
  width: 20,
  borderRadius: '50%',
  color: theme.textColors.tableHeader,
  marginTop: 52,
  minHeight: 'auto',
  minWidth: 'auto',
  padding: 0,
}));
