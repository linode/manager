import * as React from 'react';
import CommunitySVGIcon from 'src/assets/icons/community_nav.svg';
import { Link } from 'src/components/Link';
import { TopMenuIcon, StyledTopMenuIconWrapper } from './TopMenuIcon';
import { Button } from 'src/components/Button/Button';

export const Community = () => {
  return (
    <TopMenuIcon title="Linode Cloud Community (opens in new tab)">
      <Button
        aria-label="Linode Cloud Community (opens in new tab)"
        sx={{
          margin: 0,
          padding: 0,
          minWidth: 'unset',
          '&:hover': {
            backgroundColor: 'unset',
          },
        }}
        disableRipple
      >
        <Link
          aria-label="Link to Linode Community site"
          to="https://linode.com/community"
        >
          <StyledTopMenuIconWrapper>
            <CommunitySVGIcon status="community" />
          </StyledTopMenuIconWrapper>
        </Link>
      </Button>
    </TopMenuIcon>
  );
};
