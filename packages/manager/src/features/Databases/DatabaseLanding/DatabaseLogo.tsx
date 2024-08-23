import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import LogoWhite from 'src/assets/icons/db-logo-white.svg';
import Logo from 'src/assets/icons/db-logo.svg';
import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';

interface Props {
  sx?: React.CSSProperties;
}

export const DatabaseLogo = ({ sx }: Props) => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      justifyContent="center"
      sx={sx ? sx : { margin: '20px' }}
    >
      <Typography sx={{ display: 'inline-block', textAlign: 'center' }}>
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
        <Typography
          sx={{
            color: theme.palette.mode === 'light' ? theme.color.headline : '',
            display: 'flex',
            marginTop: '8px',
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
