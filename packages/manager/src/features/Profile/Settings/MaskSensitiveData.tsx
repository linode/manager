import { useMutatePreferences, usePreferences } from '@linode/queries';
import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

export const MaskSensitiveData = () => {
  const { data: isSensitiveDataMasked, isLoading } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  return (
    <Paper>
      <Typography marginBottom={1} variant="h2">
        Mask Sensitive Data
      </Typography>
      <Typography marginBottom={1} variant="body1">
        Mask IP addresses and user contact information for data privacy.
      </Typography>
      <FormControlLabel
        control={
          <Toggle
            checked={Boolean(isSensitiveDataMasked)}
            onChange={(_, checked) =>
              updatePreferences({ maskSensitiveData: checked })
            }
          />
        }
        disabled={isLoading}
        label={`Sensitive data is ${
          isSensitiveDataMasked ? 'masked' : 'visible'
        }`}
      />
    </Paper>
  );
};
