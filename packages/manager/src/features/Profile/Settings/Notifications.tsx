import { useMutateProfile, useProfile } from '@linode/queries';
import { FormControlLabel, Paper, Toggle, Typography } from '@linode/ui';
import React from 'react';

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
            checked={areEmailNotificationsEnabled}
            onChange={(_, checked) =>
              updateProfile({
                email_notifications: checked,
              })
            }
          />
        }
        disabled={isPending || isLoading}
        label={`Email alerts for account activity are ${
          areEmailNotificationsEnabled ? 'enabled' : 'disabled'
        }`}
      />
    </Paper>
  );
};
