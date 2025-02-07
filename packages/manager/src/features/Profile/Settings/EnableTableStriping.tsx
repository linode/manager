import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

export const EnableTableStriping = () => {
  const { data: isTableStripingEnabled, isLoading } = usePreferences(
    (preferences) => preferences?.isTableStripingEnabled
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  React.useEffect(() => {
    // Setting the default value to true
    if (isTableStripingEnabled === undefined) {
      updatePreferences({ isTableStripingEnabled: true });
    }
  }, [isTableStripingEnabled, updatePreferences]);

  return (
    <Paper>
      <Typography marginBottom={1} variant="h2">
        Enable Table Striping
      </Typography>
      <Typography marginBottom={1} variant="body1">
        Enable table striping for better readability.
      </Typography>
      <FormControlLabel
        control={
          <Toggle
            onChange={(_, checked) =>
              updatePreferences({ isTableStripingEnabled: checked })
            }
            checked={Boolean(isTableStripingEnabled)}
          />
        }
        label={`Table striping is ${
          isTableStripingEnabled ? 'enabled' : 'disabled'
        }`}
        disabled={isLoading}
      />
    </Paper>
  );
};
