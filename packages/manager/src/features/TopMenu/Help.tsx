import { IconButton } from '@mui/material';
import * as React from 'react';

import HelpSVGIcon from 'src/assets/icons/get_help.svg';
import { Link } from 'src/components/Link';

import { TopMenuTooltip } from './TopMenuIcon';

export const Help = () => {
  return (
    <TopMenuTooltip title="Help & Support">
      <Link to="/support">
        <IconButton
          sx={{
            '&:hover, &:focus': {
              color: '#606469',
            },
            color: '#c9c7c7',
          }}
        >
          <HelpSVGIcon height="20px" width="20px" />
        </IconButton>
      </Link>
    </TopMenuTooltip>
  );
};
