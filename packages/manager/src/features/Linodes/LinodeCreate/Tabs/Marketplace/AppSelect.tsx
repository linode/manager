import { useMarketplaceAppsQuery } from '@linode/queries';
import {
  Autocomplete,
  Box,
  Notice,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';

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
            containerProps={{ flexGrow: 1 }}
            disabled={isLoading}
            fullWidth
            hideLabel
            inputSlotProps={{ sx: { maxWidth: 'unset !important' } }}
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
