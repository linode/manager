import * as React from 'react';
import HelpSVGIcon from 'src/assets/icons/get_help.svg';
import { TopMenuIcon, StyledTopMenuIconWrapper } from './TopMenuIcon';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { useHistory } from 'react-router-dom';

export const Help = () => {
  const history = useHistory();

  return (
    <TopMenuIcon title="Help & Support">
      <StyledLinkButton
        aria-label="Help & Support"
        role="link"
        onClick={() => history.push('/support')}
      >
        <StyledTopMenuIconWrapper>
          <HelpSVGIcon status="help" />
        </StyledTopMenuIconWrapper>
      </StyledLinkButton>
    </TopMenuIcon>
  );
};
