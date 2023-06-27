import * as React from 'react';
import Link from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import Box from 'src/components/core/Box';
import Logo from 'src/assets/logo/akamai-logo.svg';
import BuildIcon from '@mui/icons-material/Build';
import Stack from '@mui/material/Stack';
import { Theme, useTheme } from '@mui/material/styles';
import { ErrorState } from 'src/components/ErrorState/ErrorState';

export const MaintenanceScreen = () => {
  const theme = useTheme<Theme>();

  return (
    <Stack justifyContent="center" bgcolor={theme.bg.main} minHeight="100vh">
      <Box display="flex" justifyContent="center">
        <Logo width={215} />
      </Box>
      <ErrorState
        CustomIcon={BuildIcon}
        CustomIconStyles={{
          color: theme.palette.text.primary,
        }}
        errorText={
          <Stack alignItems="center" spacing={2}>
            <Typography variant="h2">We are undergoing maintenance.</Typography>
            <Typography>
              Visit{' '}
              <Link to="https://status.linode.com/">
                https://status.linode.com
              </Link>{' '}
              for updates on the Cloud Manager and API.
            </Typography>
          </Stack>
        }
      />
    </Stack>
  );
};
