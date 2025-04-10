import {
  Box,
  Button,
  Checkbox,
  CloseIcon,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Paper,
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
  onRemove: () => void;
}

export const VPCIPv4Address = (props: Props) => {
  const { index, onRemove } = props;
  const { control, getValues, setValue } = useFormContext<CreateInterfaceFormValues>();

  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1 }}>
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
                onChange={(e, checked) =>
                  field.onChange(checked ? 'auto' : null)
                }
              />
              {fieldState.error?.message && (
                <FormHelperText>{fieldState.error.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name={`vpc.ipv4.addresses.${index}.primary`}
          render={({ field, fieldState }) => (
            <FormControl>
              <FormControlLabel
                checked={field.value ?? false}
                control={<Checkbox />}
                label="Primary"
                onChange={(e, checked) => {
                  const values = getValues();
                  const numberOfAddresses = values.vpc?.ipv4?.addresses?.length ?? 0;
                  for (let i = 0; i < numberOfAddresses; i++) {
                    setValue(`vpc.ipv4.addresses.${i}.primary`, i === index);
                  }
                  field.onChange(checked)
                }}
              />
              {fieldState.error?.message && (
                <FormHelperText>{fieldState.error.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        <Box>
          <Button onClick={onRemove} sx={{ p: 1 }}>
            Remove
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};
