import { Spacing } from '@akamai/cds-tokens/themes/dark';
import React from 'react';

import { ACCESS_CONTROLS_IN_SETTINGS_TEXT } from '../../constants';
import { Divider } from '../../shared/Divider/Divider';
import { Paper } from '../../shared/Paper/Paper';
import { Stack } from '../../shared/Stack/Stack';
import AccessControls from '../AccessControls';
import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { DatabaseConnectionPools } from './DatabaseConnectionPools';
import { DatabaseManageNetworking } from './DatabaseManageNetworking';

export const DatabaseNetworking = () => {
  const { database, disabled } = useDatabaseDetailContext();

  const accessControlCopy = (
    <p style={{ margin: 0 }}>{ACCESS_CONTROLS_IN_SETTINGS_TEXT}</p>
  );

  const pgBouncerEnabled = database.engine === 'postgresql';

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
