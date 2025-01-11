import { IconButton } from '@mui/material';
import * as React from 'react';

import HelpSVGIcon from 'src/assets/icons/get_help.svg';
import { Link } from 'src/components/Link';

import { TopMenuTooltip, topMenuIconButtonSx } from './TopMenuTooltip';

export const Help = () => {
  return (
    <TopMenuTooltip title="Help & Support">
      <IconButton
        disableRipple
        accessibleAriaLabel="Help & Support"
        component={Link}
        sx={topMenuIconButtonSx}
        to="/support"
      >
        <HelpSVGIcon height="24px" width="24px" />
      </IconButton>
    </TopMenuTooltip>
  );
};
