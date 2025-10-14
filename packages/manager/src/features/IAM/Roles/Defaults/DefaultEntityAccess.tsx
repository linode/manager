import { Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';

export const DefaultEntityAccess = () => {
  return (
    <Paper>
      <Stack>
        <Typography variant="h2">
          Default Entity Access for Delegate Users
        </Typography>
        <Typography marginTop={2}>
          View and update entities assigned to delegate users by default. Note
          that changes implemented here will apply only to new delegate users.
          For existing delegate users, use their Assigned Roles page to update
          the assignment.
        </Typography>
      </Stack>
    </Paper>
  );
};
