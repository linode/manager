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
          sx={(theme) => ({
            '&:hover, &:focus': {
              color: '#606469',
            },
            color: '#c9c7c7',
            [theme.breakpoints.down('sm')]: {
              padding: 1,
            },
          })}
        >
          <CommunitySVGIcon height="20px" width="20px" />
        </IconButton>
      </Link>
    </TopMenuTooltip>
  );
};
