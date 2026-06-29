import { Spacing } from '@akamai/cds-tokens/themes/dark';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { ACCESS_CONTROLS_IN_SETTINGS_TEXT } from '../../constants';
import { Divider } from '../../shared/Divider/Divider';
import { Paper } from '../../shared/Paper/Paper';
import { Stack } from '../../shared/Stack/Stack';
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
    <p style={{ margin: 0 }}>{ACCESS_CONTROLS_IN_SETTINGS_TEXT}</p>
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
    <Paper>
      <Stack
        divider={<Divider marginBottom={0} marginTop={0} />}
        spacing={Spacing.S24}
      >
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
