import * as React from 'react';
import { useHistory } from 'react-router-dom';

import HelpSVGIcon from 'src/assets/icons/get_help.svg';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';

import { StyledTopMenuIconWrapper, TopMenuIcon } from './TopMenuIcon';

export const Help = () => {
  const history = useHistory();

  return (
    <TopMenuIcon title="Help & Support">
      <StyledLinkButton
        aria-label="Help & Support"
        onClick={() => history.push('/support')}
        role="link"
      >
        <StyledTopMenuIconWrapper>
          <HelpSVGIcon status="help" />
        </StyledTopMenuIconWrapper>
      </StyledLinkButton>
    </TopMenuIcon>
  );
};
