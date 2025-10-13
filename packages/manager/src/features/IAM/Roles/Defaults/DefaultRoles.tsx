import { Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';

export const DefaultRoles = () => {
  return (
    <Paper>
      <Stack>
        <Typography variant="h2">Default Roles for Delegate Users</Typography>
        <Typography marginTop={2}>
          View and manage roles to be assigned to delegate users by default.
          Note that changes implemented here will apply to only new delegate
          users. For existing delegate users, use their Assigned Roles page to
          update the assignment.
        </Typography>
      </Stack>
    </Paper>
  );
};
