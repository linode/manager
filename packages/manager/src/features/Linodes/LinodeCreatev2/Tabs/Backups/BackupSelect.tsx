import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useController } from 'react-hook-form';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useLinodeBackupsQuery } from 'src/queries/linodes/backups';

import { useLinodeCreateQueryParams } from '../../utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const BackupSelect = () => {
  const { params } = useLinodeCreateQueryParams();
  const { field, fieldState } = useController<CreateLinodeRequest, 'backup_id'>(
    { name: 'backup_id' }
  );

  const hasSelectedLinode = params.linodeID !== undefined;

  const { data } = useLinodeBackupsQuery(
    params.linodeID ?? -1,
    hasSelectedLinode
  );

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Select Backup</Typography>
        {fieldState.error?.message && (
          <Notice text={fieldState.error.message} variant="error" />
        )}
        <Grid container spacing={2}>
          {data?.automatic.map((backup) => (
            <SelectionCard
              checked={backup.id === field.value}
              heading="Automatic"
              key={backup.id}
              onClick={() => field.onChange(backup.id)}
              subheadings={[backup.created]}
            />
          ))}
          {data?.snapshot.current && (
            <SelectionCard
              checked={data?.snapshot.current.id === field.value}
              heading={data?.snapshot.current.label ?? 'Snapshot'}
              key={data?.snapshot.current.id}
              onClick={() => field.onChange(data?.snapshot.current?.id)}
              subheadings={[data?.snapshot.current?.created]}
            />
          )}
        </Grid>
      </Stack>
    </Paper>
  );
};
