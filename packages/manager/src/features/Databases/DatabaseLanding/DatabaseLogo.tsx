import { BetaChip } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import LogoWhite from 'src/assets/icons/db-logo-white.svg';
import Logo from 'src/assets/icons/db-logo.svg';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';

import type { SxProps, Theme } from '@mui/material/styles';

interface Props {
  sx?: SxProps<Theme>;
}

export const DatabaseLogo = ({ sx }: Props) => {
  const theme = useTheme();

  const { isV2GAUser } = useIsDatabasesEnabled();
  return (
    <Box
      display="flex"
      justifyContent="center"
      sx={sx ? sx : { margin: '20px' }}
    >
      <Typography sx={{ display: 'inline-block', textAlign: 'center' }}>
        {!isV2GAUser && (
          <BetaChip
            sx={{
              backgroundColor:
                theme.palette.mode === 'light'
                  ? theme.color.label
                  : theme.color.grey7,
              color:
                theme.palette.mode === 'light' ? theme.color.white : 'primary',
            }}
            component="span"
          />
        )}
        <Typography
          sx={{
            color: theme.palette.mode === 'light' ? theme.color.headline : '',
            display: 'flex',
            marginTop: !isV2GAUser ? theme.spacing(1) : '',
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
