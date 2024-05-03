import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useController, useWatch } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { CircularProgress } from 'src/components/CircularProgress';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useLinodeBackupsQuery } from 'src/queries/linodes/backups';

import { LinodeCreateFormValues } from '../../utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const BackupSelect = () => {
  const { field, fieldState } = useController<CreateLinodeRequest, 'backup_id'>(
    { name: 'backup_id' }
  );

  const linode = useWatch<LinodeCreateFormValues, 'linode'>({ name: 'linode' });

  const hasSelectedLinode = Boolean(linode);

  const { data, isFetching } = useLinodeBackupsQuery(
    linode?.id ?? -1,
    hasSelectedLinode
  );

  const hasNoBackups = data?.automatic.length === 0 && !data.snapshot.current;

  const renderContent = () => {
    if (!hasSelectedLinode) {
      return <Typography>First, select a Linode</Typography>;
    }

    if (isFetching) {
      return (
        <Stack alignItems="center">
          <CircularProgress />
        </Stack>
      );
    }

    if (hasNoBackups) {
      return <Typography>This Linode does not have any backups.</Typography>;
    }

    return (
      <Box>
        <Grid container spacing={2}>
          {data?.automatic.map((backup) => (
            <SelectionCard
              subheadings={[
                <DateTimeDisplay
                  key={`backup-${backup.id}-date`}
                  value={backup.created}
                />,
              ]}
              checked={backup.id === field.value}
              heading="Automatic"
              key={backup.id}
              onClick={() => field.onChange(backup.id)}
            />
          ))}
          {data?.snapshot.current && (
            <SelectionCard
              subheadings={[
                <DateTimeDisplay
                  key={`backup-${data.snapshot.current.id}-date`}
                  value={data.snapshot.current.created}
                />,
              ]}
              checked={data.snapshot.current.id === field.value}
              heading={data.snapshot.current.label ?? 'Snapshot'}
              key={data.snapshot.current.id}
              onClick={() => field.onChange(data.snapshot.current!.id)}
            />
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Select Backup</Typography>
        {fieldState.error?.message && (
          <Notice text={fieldState.error.message} variant="error" />
        )}
        {renderContent()}
      </Stack>
    </Paper>
  );
};
