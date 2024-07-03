import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useMarketplaceAppsQuery } from 'src/queries/stackscripts';

import { AppsList } from './AppsList';
import { categoryOptions } from './utilities';

import type { LinodeCreateFormValues } from '../../utilities';
import type { AppCategory } from 'src/features/OneClickApps/types';

interface Props {
  /**
   * Opens the Marketplace App details drawer for the given app
   */
  onOpenDetailsDrawer: (stackscriptId: number) => void;
}

export const AppSelect = (props: Props) => {
  const { onOpenDetailsDrawer } = props;

  const {
    formState: { errors },
  } = useFormContext<LinodeCreateFormValues>();

  const { isLoading } = useMarketplaceAppsQuery(true);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AppCategory>();

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Select an App</Typography>
        {errors.stackscript_id?.message && (
          <Notice text={errors.stackscript_id.message} variant="error" />
        )}
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
            onSearch={setQuery}
            placeholder="Search for app name"
            value={query}
          />
          <Autocomplete
            textFieldProps={{
              containerProps: { sx: { minWidth: 250 } },
              hideLabel: true,
            }}
            disabled={isLoading}
            label="Select category"
            onChange={(e, value) => setCategory(value?.label)}
            options={categoryOptions}
            placeholder="Select category"
          />
        </Stack>
        <Box height="500px" sx={{ overflowX: 'hidden', overflowY: 'auto' }}>
          <AppsList
            category={category}
            onOpenDetailsDrawer={onOpenDetailsDrawer}
            query={query}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
