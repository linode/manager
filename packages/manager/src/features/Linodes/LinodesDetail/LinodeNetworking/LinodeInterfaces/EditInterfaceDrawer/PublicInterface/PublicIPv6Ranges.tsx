import {
  Button,
  CloseIcon,
  Divider,
  IconButton,
  Notice,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { AllocateIPv6Button } from './AllocateIPv6Button';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  interfaceId: number;
  linodeId: number;
}

export const PublicIPv6Ranges = (props: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'public.ipv6.ranges',
  });

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack spacing={1.5}>
        <Typography variant="h3">IPv6 Ranges</Typography>
        {errors.public?.ipv6?.ranges?.message && (
          <Notice text={errors.public?.ipv6?.ranges?.message} variant="error" />
        )}
        {fields.length === 0 ? (
          <Typography>No IPv6 ranges assigned.</Typography>
        ) : (
          <Stack divider={<Divider />}>
            {fields.map((field, index) => (
              <Stack
                alignItems="flex-start"
                direction="row"
                key={field.id}
                spacing={0.5}
              >
                <Controller
                  render={({ field, fieldState }) => (
                    <TextField
                      containerProps={{ sx: { flexGrow: 1 } }}
                      errorText={fieldState.error?.message}
                      hideLabel
                      label={`IPv6 Range ${index}`}
                      noMarginTop
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                  control={control}
                  name={`public.ipv6.ranges.${index}.range`}
                />
                <IconButton onClick={() => remove(index)} sx={{ p: 1 }}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
        <Stack direction="row" gap={1}>
          <Button buttonType="outlined" onClick={() => append({ range: '' })}>
            Manually add IPv6
          </Button>
          <AllocateIPv6Button {...props} prefix="/56" />
          <AllocateIPv6Button {...props} prefix="/64" />
        </Stack>
      </Stack>
    </Paper>
  );
};
