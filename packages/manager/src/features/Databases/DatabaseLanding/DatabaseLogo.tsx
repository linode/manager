import { Spacing } from '@akamai/cds-tokens';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import LogoWhite from 'src/assets/icons/db-logo-white.svg';
import Logo from 'src/assets/icons/db-logo.svg';

export const DatabaseLogo = () => {
  const theme = useTheme();

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', margin: Spacing.S20 }}
    >
      Powered by &nbsp;
      {theme.palette.mode === 'light' ? <Logo /> : <LogoWhite />}
    </div>
  );
};

export default DatabaseLogo;
