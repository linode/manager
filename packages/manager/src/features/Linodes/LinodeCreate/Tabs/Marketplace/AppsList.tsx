import { Box, CircleProgress, ErrorState, Stack } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { getGeneratedLinodeLabel } from '../../utilities';
import { getDefaultUDFData } from '../StackScripts/UserDefinedFields/utilities';
import { AppSection } from './AppSection';
import { AppSelectionCard } from './AppSelectionCard';
import {
  getAppSections,
  getFilteredApps,
  useMarketplaceApps,
} from './utilities';

import type { LinodeCreateFormValues } from '../../utilities';
import type { StackScript } from '@linode/api-v4';
import type { AppCategory } from 'src/features/OneClickApps/types';

interface Props {
  /**
   * The selected category to filter by
   */
  category: AppCategory | undefined;
  /**
   * Opens the Marketplace App details drawer for the given app
   */
  onOpenDetailsDrawer: (stackscriptId: number) => void;
  /**
   * The search query
   */
  query: string;
}

export const AppsList = (props: Props) => {
  const { category, onOpenDetailsDrawer, query } = props;
  const { apps, error, isLoading } = useMarketplaceApps();
  const queryClient = useQueryClient();

  const {
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const { field } = useController<LinodeCreateFormValues, 'stackscript_id'>({
    name: 'stackscript_id',
  });

  const onSelect = async (stackscript: StackScript) => {
    setValue(
      'stackscript_data',
      getDefaultUDFData(stackscript.user_defined_fields)
    );
    field.onChange(stackscript.id);

    if (!isLabelFieldDirty) {
      setValue(
        'label',
        await getGeneratedLinodeLabel({
          queryClient,
          tab: 'StackScripts',
          values: getValues(),
        })
      );
    }
  };

  if (isLoading) {
    return (
      <Box
        alignItems="center"
        display="flex"
        height="100%"
        justifyContent="center"
        width="100%"
      >
        <CircleProgress size="md" />
      </Box>
    );
  }

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (category || query) {
    const filteredApps = getFilteredApps({
      apps,
      category,
      query,
    });

    return (
      <Grid container spacing={2}>
        {filteredApps?.map((app) => (
          <AppSelectionCard
            checked={field.value === app.stackscript.id}
            iconUrl={`/assets/${app.details.logo_url}`}
            key={app.stackscript.id}
            label={app.stackscript.label}
            onOpenDetailsDrawer={() => onOpenDetailsDrawer(app.stackscript.id)}
            onSelect={() => onSelect(app.stackscript)}
          />
        ))}
      </Grid>
    );
  }

  const sections = getAppSections(apps);

  return (
    <Stack spacing={2}>
      {sections.map(({ apps, title }) => (
        <AppSection
          apps={apps}
          key={title}
          onOpenDetailsDrawer={onOpenDetailsDrawer}
          onSelect={onSelect}
          selectedStackscriptId={field.value}
          title={title}
        />
      ))}
    </Stack>
  );
};
