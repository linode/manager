import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Stack } from 'src/components/Stack';
import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';
import { useMarketplaceAppsQuery } from 'src/queries/stackscripts';

import { getDefaultUDFData } from '../StackScripts/UserDefinedFields/utilities';
import { AppSection } from './AppSection';
import { AppSelectionCard } from './AppSelectionCard';
import { getAppSections } from './utilities';

import type { LinodeCreateFormValues } from '../../utilities';
import type { StackScript } from '@linode/api-v4';

interface Props {
  /**
   * Opens the Marketplace App details drawer for the given app
   */
  onOpenDetailsDrawer: (stackscriptId: number) => void;
}

export const AppsList = ({ onOpenDetailsDrawer }: Props) => {
  const { data: stackscripts, error, isLoading } = useMarketplaceAppsQuery(
    true
  );

  const filter = null;

  const { setValue } = useFormContext<LinodeCreateFormValues>();
  const { field } = useController<LinodeCreateFormValues, 'stackscript_id'>({
    name: 'stackscript_id',
  });

  const onSelect = (stackscript: StackScript) => {
    setValue(
      'stackscript_data',
      getDefaultUDFData(stackscript.user_defined_fields)
    );
    field.onChange(stackscript.id);
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
        <CircleProgress />
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
