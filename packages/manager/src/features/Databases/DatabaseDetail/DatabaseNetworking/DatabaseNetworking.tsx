import { Divider, Paper, Stack, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { ACCESS_CONTROLS_IN_SETTINGS_TEXT } from '../../constants';
import AccessControls from '../AccessControls';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseManageNetworking } from './DatabaseManageNetworking';

export const DatabaseNetworking = () => {
  const navigate = useNavigate();
  const { database, disabled, engine, isVPCEnabled } =
    useDatabaseDetailContext();

  const accessControlCopy = (
    <Typography>{ACCESS_CONTROLS_IN_SETTINGS_TEXT}</Typography>
  );

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
      </Stack>
    </Paper>
  );
};
