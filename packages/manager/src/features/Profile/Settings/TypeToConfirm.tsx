import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

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
            onChange={(_, checked) =>
              updatePreferences({ type_to_confirm: checked })
            }
            checked={typeToConfirmPreference}
          />
        }
        label={`Type-to-confirm is ${
          typeToConfirmPreference ? 'enabled' : 'disabled'
        }`}
        disabled={isLoading}
      />
    </Paper>
  );
};
