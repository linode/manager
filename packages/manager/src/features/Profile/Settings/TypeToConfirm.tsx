import { useMutatePreferences, usePreferences } from '@linode/queries';
import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

export const TypeToConfirm = () => {
  // Type-to-confirm is enabled by default when no preference is set.
  const { data: typeToConfirmPreference, isLoading } = usePreferences(
    (preferences) => preferences?.type_to_confirm ?? true
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  return (
    <Paper>
      <Typography marginBottom={1} variant="h2">
        Type-to-Confirm
      </Typography>
      <Typography marginBottom={1} variant="body1">
        For some products and services, the type-to-confirm setting requires
        entering the label before deletion.
      </Typography>
      <FormControlLabel
        control={
          <Toggle
            checked={typeToConfirmPreference}
            onChange={(_, checked) =>
              updatePreferences({ type_to_confirm: checked })
            }
          />
        }
        disabled={isLoading}
        label={`Type-to-confirm is ${
          typeToConfirmPreference ? 'enabled' : 'disabled'
        }`}
      />
    </Paper>
  );
};
