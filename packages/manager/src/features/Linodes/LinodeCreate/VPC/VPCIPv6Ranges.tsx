import { Box, CloseIcon, IconButton, Stack, TextField } from '@linode/ui';
import { LinkButton } from '@linode/ui';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const VPCIPv6Ranges = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'interfaces.0.ipv6.ranges',
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
            name={`interfaces.0.ipv6.ranges.${index}.range`}
            render={({ field, fieldState }) => (
              <TextField
                errorText={fieldState.error?.message}
                hideLabel
                label={`IP Range ${index}`}
                onBlur={field.onBlur}
                onChange={field.onChange}
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
        <LinkButton onClick={() => append({ range: '' })}>
          Add IPv6 Range
        </LinkButton>
      </Box>
    </Stack>
  );
};
