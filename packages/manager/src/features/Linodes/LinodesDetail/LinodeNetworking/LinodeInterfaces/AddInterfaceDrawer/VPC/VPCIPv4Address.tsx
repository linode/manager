import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { CreateInterfaceFormValues } from '../utilities';

interface Props {
  index: number;
}

export const VPCIPv4Address = (props: Props) => {
  const { index } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateInterfaceFormValues>();

  return (
    <Stack spacing={1}>
      <Controller
        control={control}
        name={`vpc.ipv4.addresses.${index}.address`}
        render={({ field, fieldState }) => (
          <Box>
            <FormControlLabel
              checked={field.value === 'auto'}
              control={<Checkbox />}
              label="Auto-assign a VPC IPv4 address"
              onChange={(e, checked) => field.onChange(checked ? 'auto' : '')}
            />
            {field.value !== 'auto' && (
              <TextField
                containerProps={{ sx: { mb: 1.5, mt: 1 } }}
                errorText={
                  fieldState.error?.message ??
                  errors.vpc?.ipv4?.addresses?.[index]?.message
                }
                label="VPC IPv4"
                noMarginTop
                onBlur={field.onBlur}
                onChange={field.onChange}
                required
                value={field.value}
              />
            )}
          </Box>
        )}
      />
      <Controller
        control={control}
        name={`vpc.ipv4.addresses.${index}.nat_1_1_address`}
        render={({ field, fieldState }) => (
          <FormControl>
            <FormControlLabel
              checked={field.value === 'auto'}
              control={<Checkbox />}
              label={
                <Stack alignItems="center" direction="row">
                  <Typography>
                    Assign a public IPv4 address for this Linode
                  </Typography>
                  <TooltipIcon
                    status="help"
                    text="Access the internet through the public IPv4 address using static 1:1 NAT."
                  />
                </Stack>
              }
              onChange={(e, checked) => field.onChange(checked ? 'auto' : null)}
            />
            {fieldState.error?.message && (
              <FormHelperText>{fieldState.error.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    </Stack>
  );
};
