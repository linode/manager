import Grid from '@mui/material/Unstable_Grid2';
import React from 'react';

import { Divider } from 'src/components/Divider';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';

import { AppSelectionCard } from './AppSelectionCard';

import type { StackScript } from '@linode/api-v4';

interface Props {
  onOpenDetailsDrawer: (stackscriptId: number) => void;
  onSelect: (stackscript: StackScript) => void;
  selectedStackscriptId: null | number | undefined;
  stackscripts: StackScript[];
  title: string;
}

export const AppSection = (props: Props) => {
  const {
    onOpenDetailsDrawer,
    onSelect,
    selectedStackscriptId,
    stackscripts,
    title,
  } = props;

  return (
    <Stack>
      <Typography variant="h2">{title}</Typography>
      <Divider spacingBottom={16} spacingTop={16} />
      <Grid container spacing={2}>
        {stackscripts?.map((stackscript) => (
          <AppSelectionCard
            checked={stackscript.id === selectedStackscriptId}
            iconUrl={`/assets/${oneClickApps[stackscript.id].logo_url}`}
            key={stackscript.id}
            label={stackscript.label}
            onOpenDetailsDrawer={() => onOpenDetailsDrawer(stackscript.id)}
            onSelect={() => onSelect(stackscript)}
          />
        ))}
      </Grid>
    </Stack>
  );
};
