import {
  Box,
  CloseIcon,
  IconButton,
  LinkButton,
  Stack,
  TextField,
} from '@linode/ui';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const VPCRanges = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'interfaces.0.ip_ranges',
  });

  return (
    <Stack spacing={1}>
      {fields.map((field, index) => (
        <Stack
          alignItems="flex-start"
          direction="row"
          key={field.id}
          spacing={0.5}
        >
          <Controller
            control={control}
            name={`interfaces.0.ip_ranges.${index}`}
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                hideLabel
                label={`IP Range ${index}`}
                onBlur={field.onBlur}
                onChange={field.onChange}
                // eslint-disable-next-line sonarjs/no-hardcoded-ip
                placeholder="10.0.0.0/24"
                sx={{ minWidth: 290 }}
                value={field.value}
              />
            )}
          />
          <IconButton
            aria-label={`Remove IP Range ${index}`}
            onClick={() => remove(index)}
            sx={{ padding: 0.75 }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      ))}
      <Box>
        <LinkButton onClick={() => append('')}>Add IPv4 Range</LinkButton>
      </Box>
    </Stack>
  );
};
