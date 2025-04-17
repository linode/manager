import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Notice,
  Stack,
  TextField,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPCPublicIPLabel } from 'src/features/VPCs/components/VPCPublicIPLabel';

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

  const error = errors.vpc?.ipv4?.addresses?.[index]?.message;

  return (
    <Stack spacing={1}>
      {error && (
        <Notice variant="error">
          <ErrorMessage message={error} />
        </Notice>
      )}
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
              sx={{ pl: 0.4 }}
            />
            {field.value !== 'auto' && (
              <TextField
                containerProps={{ sx: { mb: 1.5, mt: 1 } }}
                errorText={fieldState.error?.message}
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
              label={<VPCPublicIPLabel />}
              onChange={(e, checked) => field.onChange(checked ? 'auto' : null)}
              sx={{ pl: 0.4 }}
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
