import {
  Box,
  CloseIcon,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { VPCRangesDescription } from 'src/features/VPCs/components/VPCRangesDescription';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

export const VPCIPv4Ranges = () => {
  const { control, setFocus } = useFormContext<ModifyLinodeInterfacePayload>();
  const { fields, remove, append } = useFieldArray({
    control,
    name: 'vpc.ipv4.ranges',
  });

  return (
    <Stack spacing={1}>
      <Typography variant="h3">IPv4 Ranges</Typography>
      <VPCRangesDescription />
      {fields.map((field, index) => (
        <Stack
          alignItems="flex-start"
          direction="row"
          key={field.id}
          spacing={1}
        >
          <Controller
            control={control}
            name={`vpc.ipv4.ranges.${index}.range`}
            render={({ field, fieldState }) => (
              <TextField
                containerProps={{ flexGrow: 1 }}
                errorText={fieldState.error?.message}
                hideLabel
                inputRef={field.ref}
                label={`VPC IPv4 Range ${index}`}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
          <IconButton
            onClick={() => {
              remove(index);

              const previousRangeIndex = index - 1;

              // If there is a previous range, focus it when the current one is removed
              if (previousRangeIndex >= 0) {
                setFocus(`vpc.ipv4.ranges.${previousRangeIndex}.range`);
              }
            }}
            sx={{ p: 1 }}
            title="Remove"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      ))}
      <Box>
        <LinkButton onClick={() => append({ range: '' })}>
          Add IPv4 Range
        </LinkButton>
      </Box>
    </Stack>
  );
};
