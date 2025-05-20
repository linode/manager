import { Divider, Stack, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import React from 'react';

import { AppSelectionCard } from './AppSelectionCard';

import type { MarketplaceApp } from './utilities';
import type { StackScript } from '@linode/api-v4';

interface Props {
  apps: MarketplaceApp[];
  onOpenDetailsDrawer: (stackscriptId: number) => void;
  onSelect: (stackscript: StackScript) => void;
  selectedStackscriptId: null | number | undefined;
  title: string;
}

export const AppSection = (props: Props) => {
  const { apps, onOpenDetailsDrawer, onSelect, selectedStackscriptId, title } =
    props;

  return (
    <Stack>
      <Typography variant="h2">{title}</Typography>
      <Divider spacingBottom={16} spacingTop={16} />
      <Grid container spacing={2}>
        {apps?.map((app) => (
          <AppSelectionCard
            checked={app.stackscript.id === selectedStackscriptId}
            iconUrl={`/assets/${app.details.logo_url}`}
            key={app.stackscript.id}
            label={app.stackscript.label}
            onOpenDetailsDrawer={() => onOpenDetailsDrawer(app.stackscript.id)}
            onSelect={() => onSelect(app.stackscript)}
          />
        ))}
      </Grid>
    </Stack>
  );
};
