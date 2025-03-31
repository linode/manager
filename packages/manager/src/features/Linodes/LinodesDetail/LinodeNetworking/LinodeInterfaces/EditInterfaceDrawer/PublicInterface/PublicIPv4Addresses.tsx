import { Divider, Notice, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import { PublicIPv4Address } from './PublicIPv4Address';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';
import { useAllocatePublicIPv4 } from './utilities';

interface Props {
  interfaceId: number;
  linodeId: number;
}

export const PublicIPv4Addresses = (props: Props) => {
  const {
    control,
    formState: { errors, isDirty },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const { isAllocating, onAllocate } = useAllocatePublicIPv4(props);

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'public.ipv4.addresses',
  });

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack spacing={1.5}>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
        >
          <Typography variant="h3">IPv4 Addresses</Typography>
          <ActionMenu
            actionsList={[
              {
                disabled: isDirty || isAllocating,
                onClick: onAllocate,
                title: 'Allocate another public IPv4',
                tooltip: isDirty
                  ? 'Save or reset active changes to allocate a new IPv4 address.'
                  : undefined,
              },
              {
                onClick: () => append({ address: '', primary: false }),
                title: 'Manually add public IPv4',
              },
            ]}
            ariaLabel="Public IPv4 Addresses Action Menu"
          />
        </Stack>
        {errors.public?.ipv4?.addresses?.message && (
          <Notice
            text={errors.public?.ipv4?.addresses?.message}
            variant="error"
          />
        )}
        {fields.length === 0 ? (
          <Typography>No public IPv4 addresses assigned.</Typography>
        ) : (
          <Stack divider={<Divider />} spacing={2}>
            {fields.map((field, index) => (
              <PublicIPv4Address
                index={index}
                key={field.id}
                onRemove={remove}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
