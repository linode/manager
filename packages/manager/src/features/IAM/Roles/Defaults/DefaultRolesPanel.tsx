import { Box, Button, Paper, Typography } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

export const DefaultRolesPanel = () => {
  const navigate = useNavigate();

  return (
    <Paper>
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="h2">Default Roles for Delegate Users</Typography>
          <Typography marginTop={2}>
            View and manage roles to be assigned to new delegated users by
            default.
          </Typography>
        </Box>
        <Box>
          <Button
            buttonType="outlined"
            onClick={() => navigate({ to: '/iam/roles/defaults/roles' })}
          >
            View Default Roles
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
