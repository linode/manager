import { IconButton } from '@mui/material';
import * as React from 'react';

import CommunitySVGIcon from 'src/assets/icons/community_nav.svg';
import { Link } from 'src/components/Link';
import { LINODE_COMMUNITY_URL } from 'src/constants';

import { TopMenuTooltip } from './TopMenuIcon';

export const Community = () => {
  return (
    <TopMenuTooltip title="Linode Cloud Community (opens in new tab)">
      <Link to={LINODE_COMMUNITY_URL}>
        <IconButton
          sx={{
            '&:hover, &:focus': {
              color: '#606469',
            },
            color: '#c9c7c7',
          }}
        >
          <CommunitySVGIcon height="20px" width="20px" />
        </IconButton>
      </Link>
    </TopMenuTooltip>
  );
};
