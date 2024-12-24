import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

import {
  useMutatePreferences,
  usePreferences,
} from 'src/queries/profile/preferences';

export const TypeToConfirm = () => {
  const { data: typeToConfirmPreference } = usePreferences(
    (preferences) => preferences?.type_to_confirm
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  // Type-to-confirm is enabled by default (no preference is set)
  // or if the user explicitly enables it.
  const isTypeToConfirmEnabled =
    typeToConfirmPreference === undefined || typeToConfirmPreference === true;

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
            checked={isTypeToConfirmEnabled}
          />
        }
        label={`Type-to-confirm is ${
          isTypeToConfirmEnabled ? 'enabled' : 'disabled'
        }`}
      />
    </Paper>
  );
};
