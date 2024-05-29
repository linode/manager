import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { CircularProgress } from 'src/components/CircularProgress';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';
import { useMarketplaceAppsQuery } from 'src/queries/stackscripts';

import { getDefaultUDFData } from '../StackScripts/UserDefinedFields/utilities';
import { AppSection } from './AppSection';
import { AppSelectionCard } from './AppSelectionCard';
import { categoryOptions, getAppSections } from './utilities';

import type { LinodeCreateFormValues } from '../../utilities';
import type { StackScript } from '@linode/api-v4';

interface Props {
  /**
   * Opens the Marketplace App details drawer for the given app
   */
  onOpenDetailsDrawer: (stackscriptId: number) => void;
}

export const AppSelect = (props: Props) => {
  const { onOpenDetailsDrawer } = props;
  const { setValue } = useFormContext<LinodeCreateFormValues>();
  const { field } = useController<LinodeCreateFormValues, 'stackscript_id'>({
    name: 'stackscript_id',
  });

  const filter = null;

  const { data: stackscripts, error, isLoading } = useMarketplaceAppsQuery(
    true
  );

  const onSelect = (stackscript: StackScript) => {
    setValue(
      'stackscript_data',
      getDefaultUDFData(stackscript.user_defined_fields)
    );
    field.onChange(stackscript.id);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          alignItems="center"
          display="flex"
          height="100%"
          justifyContent="center"
          width="100%"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <ErrorState errorText={error?.[0].reason} />;
    }

    if (filter) {
      return (
        <Grid container spacing={2}>
          {stackscripts?.map((stackscript) => (
            <AppSelectionCard
              checked={field.value === stackscript.id}
              iconUrl={`/assets/${oneClickApps[stackscript.id].logo_url}`}
              key={stackscript.id}
              label={stackscript.label}
              onOpenDetailsDrawer={() => onOpenDetailsDrawer(stackscript.id)}
              onSelect={() => onSelect(stackscript)}
            />
          ))}
        </Grid>
      );
    }

    const sections = getAppSections(stackscripts);

    return (
      <Stack spacing={2}>
        {sections.map(({ stackscripts, title }) => (
          <AppSection
            key={title}
            onOpenDetailsDrawer={onOpenDetailsDrawer}
            onSelect={onSelect}
            selectedStackscriptId={field.value}
            stackscripts={stackscripts}
            title={title}
          />
        ))}
      </Stack>
    );
  };

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
        <Box height="500px" sx={{ overflowX: 'hidden', overflowY: 'auto' }}>
          {renderContent()}
        </Box>
      </Stack>
    </Paper>
  );
};
