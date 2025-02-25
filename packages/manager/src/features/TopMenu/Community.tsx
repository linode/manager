import { IconButton } from '@mui/material';
import * as React from 'react';

import CommunitySVGIcon from 'src/assets/icons/community_nav.svg';
import { LINODE_COMMUNITY_URL } from 'src/constants';

import { TopMenuTooltip, topMenuIconButtonSx } from './TopMenuTooltip';

export const Community = () => {
  return (
    <TopMenuTooltip title="Linode Cloud Community (opens in new tab)">
      <IconButton
        aria-label="Linode Cloud Community - link opens in a new tab"
        disableRipple
        href={LINODE_COMMUNITY_URL}
        sx={topMenuIconButtonSx}
        target="_blank"
      >
        <CommunitySVGIcon height="24px" width="24px" />
      </IconButton>
    </TopMenuTooltip>
  );
};
