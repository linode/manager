import { Divider, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { ACCESS_CONTROLS_IN_SETTINGS_TEXT } from '../../constants';
import AccessControls from '../AccessControls';
import { DatabaseManageNetworking } from './DatabaseManageNetworking';

import type { Database } from '@linode/api-v4';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseNetworking = ({ database, disabled }: Props) => {
  const accessControlCopy = (
    <Typography>{ACCESS_CONTROLS_IN_SETTINGS_TEXT}</Typography>
  );

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
