import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import { LinodeCreateFormValues } from '../../utilities';
import { LinodeSelectTable } from '../Backups/LinodeSelectTable';
import { CloneWarning } from './CloneWarning';

export const Clone = () => {
  const {
    formState: { errors },
  } = useFormContext<LinodeCreateFormValues>();

  return (
    <Paper>
      <Stack spacing={1}>
        <Typography variant="h2">Select Linode to Clone From</Typography>
        {errors.linode?.message && (
          <Notice text={errors.linode.message} variant="error" />
        )}
        <CloneWarning />
        <LinodeSelectTable enablePowerOff />
      </Stack>
    </Paper>
  );
};
