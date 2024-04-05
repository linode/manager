import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { IconButton } from 'src/components/IconButton';
import { LinkButton } from 'src/components/LinkButton';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const VPCRanges = () => {
  const { control } = useFormContext<CreateLinodeRequest>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'interfaces.2.ip_ranges',
  });

  return (
    <Stack spacing={1}>
      <Stack>
        {fields.map((field, index) => (
          <Stack alignItems="center" direction="row" key={field.id}>
            <Controller
              render={({ field }) => (
                <TextField
                  hideLabel
                  label={`IP Range ${index}`}
                  onChange={field.onChange}
                  placeholder="10.0.0.0/24"
                  value={field.value}
                />
              )}
              control={control}
              name={`interfaces.2.ip_ranges.${index}`}
            />
            <IconButton
              aria-label={`Remove IP Range ${index}`}
              onClick={() => remove(index)}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Box>
        <LinkButton onClick={() => append('')}>Add IPv4 Range</LinkButton>
      </Box>
    </Stack>
  );
};
