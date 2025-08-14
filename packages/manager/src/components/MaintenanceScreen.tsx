import { Box, ErrorState, Stack, SvgIcon, Typography } from '@linode/ui';
import BuildIcon from '@mui/icons-material/Build';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import LightThemeAkamaiLogo from 'src/assets/logo/akamai-logo-navy-text.svg';
import DarkThemeAkamaiLogo from 'src/assets/logo/akamai-logo-white-text.svg';
import { Link } from 'src/components/Link';

import type { Theme } from '@mui/material/styles';

export const MaintenanceScreen = () => {
  const theme = useTheme<Theme>();

  const Logo =
    theme.name === 'light' ? LightThemeAkamaiLogo : DarkThemeAkamaiLogo;

  return (
    <Stack bgcolor={theme.bg.main} justifyContent="center" minHeight="100vh">
      <Box display="flex" justifyContent="center">
        <SvgIcon
          component={Logo}
          inheritViewBox
          sx={{ width: '100%', height: '85px' }}
        />
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
