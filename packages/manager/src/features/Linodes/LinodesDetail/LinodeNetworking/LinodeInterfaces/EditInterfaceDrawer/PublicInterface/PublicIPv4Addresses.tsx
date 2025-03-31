import { Button, Divider, Notice, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { AllocateIPv4Button } from './AllocateIPv4Button';
import { PublicIPv4Address } from './PublicIPv4Address';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  interfaceId: number;
  linodeId: number;
}

export const PublicIPv4Addresses = (props: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'public.ipv4.addresses',
  });

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack spacing={1.5}>
        <Typography variant="h3">IPv4 Addresses</Typography>
        <Stack divider={<Divider />} spacing={2}>
          {errors.public?.ipv4?.addresses?.message && (
            <Notice
              text={errors.public?.ipv4?.addresses?.message}
              variant="error"
            />
          )}
          {fields.map((field, index) => (
            <PublicIPv4Address index={index} key={field.id} onRemove={remove} />
          ))}
        </Stack>
        <Stack direction="row" gap={1}>
          <Button
            buttonType="outlined"
            onClick={() => append({ address: '', primary: false })}
          >
            Manually Add IPv4
          </Button>
          <AllocateIPv4Button {...props} />
        </Stack>
      </Stack>
    </Paper>
  );
};
