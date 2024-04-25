import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import { categoryOptions } from './utilities';

export const Marketplace = () => {
  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Select an App</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <DebouncedSearchTextField
            InputProps={{ sx: { maxWidth: 'unset !important' } }}
            containerProps={{ flexGrow: 1 }}
            fullWidth
            hideLabel
            label="Search marketplace"
            noMarginTop
            placeholder="Search for app name"
          />
          <Autocomplete
            textFieldProps={{
              containerProps: { sx: { minWidth: 250 } },
              hideLabel: true,
            }}
            label="Select category"
            options={categoryOptions}
            placeholder="Select category"
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
