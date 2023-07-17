import * as React from 'react';

import CommunitySVGIcon from 'src/assets/icons/community_nav.svg';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { LINODE_COMMUNITY_URL } from 'src/constants';

import { StyledTopMenuIconWrapper, TopMenuIcon } from './TopMenuIcon';

export const Community = () => {
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  return (
    <TopMenuIcon title="Linode Cloud Community (opens in new tab)">
      <StyledLinkButton
        aria-label="Linode Cloud Community (opens in new tab)"
        onClick={() => openInNewTab(LINODE_COMMUNITY_URL)}
        role="link"
      >
        <StyledTopMenuIconWrapper>
          <CommunitySVGIcon status="community" />
        </StyledTopMenuIconWrapper>
      </StyledLinkButton>
    </TopMenuIcon>
  );
};
