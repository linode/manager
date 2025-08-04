import { Box, Button, Paper, Typography, useTheme } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import Bell from 'src/assets/icons/notification.svg';

import type { Theme } from '@linode/ui';

export const UsersLandingRedirectInfo = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Paper
      sx={(theme: Theme) => ({
        marginTop: theme.spacingFunction(16),
      })}
      variant="outlined"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          paddingTop: theme.tokens.spacing.S24,
          paddingBottom: theme.tokens.spacing.S24,
        }}
      >
        <Bell height="40" width="40" />
        <Typography
          sx={{
            marginTop: theme.tokens.spacing.S24,
            maxWidth: '660px',
            textAlign: 'center',
            marginBottom: theme.tokens.spacing.S24,
          }}
        >
          User details and access settings were moved and are now available in
          the new Identity and Access tool. You can access it through the main
          menu or by clicking the button below.
        </Typography>

        <Button
          buttonType="primary"
          onClick={() => navigate({ to: '/iam/users' })}
        >
          Go to Identity and Access
        </Button>
      </Box>
    </Paper>
  );
};
