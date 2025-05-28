import { Notice, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { Firewall } from './Firewall';
import { InterfaceGeneration } from './InterfaceGeneration';
import { LinodeInterface } from './LinodeInterface';

import type { LinodeCreateFormValues } from '../utilities';

export const Networking = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<LinodeCreateFormValues>();

  // Our state is an array of interfaces in case we ever
  // allow the user to configure multiple interfaces on
  // the Linode Create flow.
  const { fields } = useFieldArray({
    control,
    name: 'linodeInterfaces',
  });

  const interfaceGeneration = useWatch({
    control,
    name: 'interface_generation',
  });

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Networking</Typography>
        <InterfaceGeneration />
        {errors.linodeInterfaces?.message && (
          <Notice text={errors.linodeInterfaces.message} variant="error" />
        )}
        {fields.map((field, index) => (
          <LinodeInterface index={index} key={field.id} />
        ))}
        {interfaceGeneration !== 'linode' && <Firewall />}
      </Stack>
    </Paper>
  );
};
