import { IconButton } from '@mui/material';
import * as React from 'react';

import CommunitySVGIcon from 'src/assets/icons/community_nav.svg';
import { Link } from 'src/components/Link';
import { LINODE_COMMUNITY_URL } from 'src/constants';

import { TopMenuTooltip, topMenuIconButtonSx } from './TopMenuTooltip';

export const Community = () => {
  return (
    <TopMenuTooltip title="Linode Cloud Community (opens in new tab)">
      <Link to={LINODE_COMMUNITY_URL}>
        <IconButton sx={topMenuIconButtonSx}>
          <CommunitySVGIcon height="20px" width="20px" />
        </IconButton>
      </Link>
    </TopMenuTooltip>
  );
};
