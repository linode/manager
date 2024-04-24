import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { Paper } from 'src/components/Paper';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { Skeleton } from 'src/components/Skeleton';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useLinodeBackupsQuery } from 'src/queries/linodes/backups';

import { useLinodeCreateQueryParams } from '../../utilities';

export const BackupSelect = () => {
  const { params } = useLinodeCreateQueryParams();

  const hasSelectedLinode = params.linodeID !== undefined;

  const { data, isFetching } = useLinodeBackupsQuery(
    params.linodeID ?? -1,
    hasSelectedLinode
  );

  const backups = data?.automatic ?? [];

  if (data?.snapshot.current) {
    backups.push(data.snapshot.current);
  }

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Select Backup</Typography>
        <Grid container gap={2}>
          {backups.map((backup) => (
            <SelectionCard
              checked={false}
              heading={backup.type}
              key={backup.id}
              onClick={() => null}
              subheadings={[backup.created]}
            />
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
};
