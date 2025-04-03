import { BetaChip, Box, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import LogoWhite from 'src/assets/icons/db-logo-white.svg';
import Logo from 'src/assets/icons/db-logo.svg';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';

import type { SxProps, Theme } from '@mui/material/styles';

interface Props {
  sx?: SxProps<Theme>;
}

export const DatabaseLogo = ({ sx }: Props) => {
  const theme = useTheme();

  const { isDatabasesV2GA } = useIsDatabasesEnabled();
  return (
    <Box
      display="flex"
      justifyContent="center"
      sx={sx ? sx : { margin: '20px' }}
    >
      <Typography sx={{ display: 'inline-block', textAlign: 'center' }}>
        {!isDatabasesV2GA && <BetaChip component="span" />}
        <Typography
          sx={{
            color: theme.palette.mode === 'light' ? theme.color.headline : '',
            display: 'flex',
            marginTop: !isDatabasesV2GA ? theme.spacing(1) : '',
          }}
          component="span"
        >
          Powered by &nbsp;
          {theme.palette.mode === 'light' ? <Logo /> : <LogoWhite />}
        </Typography>
      </Typography>
    </Box>
  );
};

export default DatabaseLogo;
