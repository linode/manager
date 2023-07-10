import * as React from 'react';
import BuildIcon from '@mui/icons-material/Build';
import Logo from 'src/assets/logo/akamai-logo.svg';
import Stack from '@mui/material/Stack';
import { Box } from 'src/components/Box';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Link } from 'src/components/Link';
import { Theme, useTheme } from '@mui/material/styles';
import { Typography } from 'src/components/Typography';

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
