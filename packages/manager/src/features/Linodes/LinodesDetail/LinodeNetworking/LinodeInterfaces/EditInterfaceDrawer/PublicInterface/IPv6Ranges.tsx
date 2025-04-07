import {
  Box,
  CloseIcon,
  IconButton,
  Notice,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';

import { useAllocateIPv6Range } from './utilities';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  interfaceId: number;
  linodeId: number;
}

export const IPv6Ranges = (props: Props) => {
  const {
    control,
    formState: { errors, isDirty },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const {
    isAllocating: isAllocating56,
    onAllocate: onAllocate56,
  } = useAllocateIPv6Range({ ...props, prefix: '/56' });
  const {
    isAllocating: isAllocating64,
    onAllocate: onAllocate64,
  } = useAllocateIPv6Range({ ...props, prefix: '/64' });

  const { fields, remove } = useFieldArray({
    control,
    name: 'public.ipv6.ranges',
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="h3">IPv6 Ranges</Typography>
      {errors.public?.ipv6?.ranges?.message && (
        <Notice text={errors.public?.ipv6?.ranges?.message} variant="error" />
      )}
      {fields.length === 0 ? (
        <Typography>No IPv6 ranges assigned.</Typography>
      ) : (
        <Stack spacing={1}>
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
      <Stack justifyContent="flex-start" spacing={1}>
        <Box>
          <LinkButton
            isDisabled={isDirty}
            isLoading={isAllocating56}
            onClick={onAllocate56}
          >
            Add IPv6 /56 Range
          </LinkButton>
        </Box>
        <Box>
          <LinkButton
            isDisabled={isDirty}
            isLoading={isAllocating64}
            onClick={onAllocate64}
          >
            Add IPv6 /64 Range
          </LinkButton>
        </Box>
      </Stack>
    </Stack>
  );
};
