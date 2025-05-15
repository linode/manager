import { useMutatePreferences, usePreferences } from '@linode/queries';
import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

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
            checked={Boolean(isTableStripingEnabled)}
            onChange={(_, checked) =>
              updatePreferences({ isTableStripingEnabled: checked })
            }
          />
        }
        disabled={isLoading}
        label={`Table striping is ${
          isTableStripingEnabled ? 'enabled' : 'disabled'
        }`}
      />
    </Paper>
  );
};
