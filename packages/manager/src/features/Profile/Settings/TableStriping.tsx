import { useMutatePreferences, usePreferences } from '@linode/queries';
import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

import { getIsTableStripingEnabled } from './TableStriping.utils';

export const TableStriping = () => {
  const { data: tableStripingPreference, isLoading } = usePreferences(
    (preferences) => preferences?.isTableStripingEnabled
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const isEnabled = getIsTableStripingEnabled(tableStripingPreference);

  return (
    <Paper>
      <Typography marginBottom={1} variant="h2">
        Table Striping
      </Typography>
      <Typography marginBottom={1} variant="body1">
        Enable table striping for better readability.
      </Typography>
      <FormControlLabel
        control={
          <Toggle
            checked={isEnabled}
            onChange={(_, checked) =>
              updatePreferences({ isTableStripingEnabled: checked })
            }
          />
        }
        disabled={isLoading}
        label={`Table striping is ${isEnabled ? 'enabled' : 'disabled'}`}
      />
    </Paper>
  );
};
