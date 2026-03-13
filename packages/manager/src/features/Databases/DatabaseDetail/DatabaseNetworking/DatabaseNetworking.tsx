import { Divider, Paper, Stack, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { ACCESS_CONTROLS_IN_SETTINGS_TEXT } from '../../constants';
import AccessControls from '../AccessControls';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseConnectionPools } from './DatabaseConnectionPools';
import { DatabaseManageNetworking } from './DatabaseManageNetworking';

export const DatabaseNetworking = () => {
  const flags = useFlags();
  const navigate = useNavigate();
  const { database, disabled, engine, isVPCEnabled } =
    useDatabaseDetailContext();

  const accessControlCopy = (
    <Typography>{ACCESS_CONTROLS_IN_SETTINGS_TEXT}</Typography>
  );

  const pgBouncerEnabled =
    flags.databasePgBouncer && database.engine === 'postgresql';

  if (!isVPCEnabled) {
    navigate({
      to: `/databases/$engine/$databaseId/summary`,
      params: {
        engine,
        databaseId: database.id,
      },
    });
    return null;
  }

  return (
    <Paper sx={{ marginTop: 2 }}>
      <Stack divider={<Divider spacingBottom={0} spacingTop={0} />} spacing={3}>
        <AccessControls
          database={database}
          description={accessControlCopy}
          disabled={disabled}
        />
        <DatabaseManageNetworking database={database} />
        {pgBouncerEnabled && <DatabaseConnectionPools database={database} />}
      </Stack>
    </Paper>
  );
};
