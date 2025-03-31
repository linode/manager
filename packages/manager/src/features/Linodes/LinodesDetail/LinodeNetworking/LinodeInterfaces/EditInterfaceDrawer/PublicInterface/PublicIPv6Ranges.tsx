import {
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

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';
import { useAllocateIPv6Range } from './utilities';

interface Props {
  interfaceId: number;
  linodeId: number;
}

export const PublicIPv6Ranges = (props: Props) => {
  const {
    control,
    formState: { errors, isDirty },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const { isAllocating, onAllocate } = useAllocateIPv6Range(props);

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'public.ipv6.ranges',
  });

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack spacing={1.5}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
        >
          <Typography variant="h3">IPv6 Ranges</Typography>
          <ActionMenu
            actionsList={[
              {
                disabled: isDirty || isAllocating,
                onClick: () => onAllocate('/56'),
                title: 'Allocate a /56 IPv6 range',
                tooltip: isDirty
                  ? 'Save or reset active changes to allocate a new IPv6 range.'
                  : undefined,
              },
              {
                disabled: isDirty || isAllocating,
                onClick: () => onAllocate('/64'),
                title: 'Allocate a /64 IPv6 range',
                tooltip: isDirty
                  ? 'Save or reset active changes to allocate a new IPv6 range.'
                  : undefined,
              },
              {
                onClick: () => append({ range: '' }),
                title: 'Manually add IPv6 range',
              },
            ]}
            ariaLabel="IPv6 ranges Action Menu"
          />
        </Stack>
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
      </Stack>
    </Paper>
  );
};
