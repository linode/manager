import { IconButton } from '@mui/material';
import * as React from 'react';

import HelpSVGIcon from 'src/assets/icons/get_help.svg';
import { Link } from 'src/components/Link';

import { TopMenuTooltip, topMenuIconButtonSx } from './TopMenuTooltip';

export const Help = () => {
  return (
    <TopMenuTooltip title="Help & Support">
      <Link accessibleAriaLabel="Help & Support" to="/support">
        <IconButton sx={topMenuIconButtonSx}>
          <HelpSVGIcon height="20px" width="20px" />
        </IconButton>
      </Link>
    </TopMenuTooltip>
  );
};
