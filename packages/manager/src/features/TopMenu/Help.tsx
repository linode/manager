import { IconButton } from '@mui/material';
import * as React from 'react';

import HelpSVGIcon from 'src/assets/icons/get_help.svg';
import { Link } from 'src/components/Link';

import { TopMenuTooltip, topMenuIconButtonSx } from './TopMenuTooltip';

export const Help = () => {
  return (
    <TopMenuTooltip title="Help & Support">
      <IconButton
        accessibleAriaLabel="Help & Support"
        component={Link}
        sx={topMenuIconButtonSx}
        to="/support"
      >
        <HelpSVGIcon height="20px" width="20px" />
      </IconButton>
    </TopMenuTooltip>
  );
};
