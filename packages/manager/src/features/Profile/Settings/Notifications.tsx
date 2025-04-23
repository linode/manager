import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

import { useMutateProfile, useProfile } from '@linode/queries';

export const Notifications = () => {
  const { data: profile, isLoading } = useProfile();
  const { isPending, mutateAsync: updateProfile } = useMutateProfile();

  const areEmailNotificationsEnabled = Boolean(profile?.email_notifications);

  return (
    <Paper>
      <Typography marginBottom={1} variant="h2">
        Notifications
      </Typography>
      <FormControlLabel
        control={
          <Toggle
            onChange={(_, checked) =>
              updateProfile({
                email_notifications: checked,
              })
            }
            checked={areEmailNotificationsEnabled}
          />
        }
        label={`Email alerts for account activity are ${
          areEmailNotificationsEnabled ? 'enabled' : 'disabled'
        }`}
        disabled={isPending || isLoading}
      />
    </Paper>
  );
};
