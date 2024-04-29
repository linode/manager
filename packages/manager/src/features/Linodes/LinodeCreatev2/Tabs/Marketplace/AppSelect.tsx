import Grid from '@mui/material/Unstable_Grid2';
import React, { useState } from 'react';
import { useController } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useMarketplaceAppsQuery } from 'src/queries/stackscripts';

import { AppSelectionCard } from './AppSelectionCard';
import { categoryOptions } from './utilities';

import type { LinodeCreateFormValues } from '../../utilities';

export const AppSelect = () => {
  const { field } = useController<LinodeCreateFormValues, 'stackscript_id'>({
    name: 'stackscript_id',
  });

  const [query, setQuery] = useState('');
  const { data: apps, isLoading, error } = useMarketplaceAppsQuery(true);

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Select an App</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <DebouncedSearchTextField
            InputProps={{ sx: { maxWidth: 'unset !important' } }}
            containerProps={{ flexGrow: 1 }}
            disabled={isLoading}
            fullWidth
            hideLabel
            label="Search marketplace"
            loading={isLoading}
            noMarginTop
            placeholder="Search for app name"
          />
          <Autocomplete
            textFieldProps={{
              containerProps: { sx: { minWidth: 250 } },
              hideLabel: true,
            }}
            disabled={isLoading}
            label="Select category"
            options={categoryOptions}
            placeholder="Select category"
          />
        </Stack>
        <Box maxHeight="500px" sx={{ overflowX: 'hidden', overflowY: 'auto' }}>
          <Grid container spacing={2}>
            {apps?.map((app) => (
              <AppSelectionCard
                checked={field.value === app.id}
                iconUrl={app.logo_url}
                id={app.id}
                key={app.label}
                label={app.label}
                onOpenDetailsDrawer={() => alert('details')}
                onSelect={() => field.onChange(app.id)}
              />
            ))}
          </Grid>
        </Box>
      </Stack>
    </Paper>
  );
};
