import * as React from 'react';
import HelpIcon from 'src/assets/icons/get_help.svg';
import Link from 'src/components/Link';
import TopMenuIcon from './TopMenuIcon';
import { StyledTopMenuIconWrapper } from './TopMenuIcon';

export const Help = () => {
  return (
    <Link aria-label="Link to Linode Support" to="/support">
      <StyledTopMenuIconWrapper
        sx={{
          marginLeft: '8px',
        }}
      >
        <TopMenuIcon title={'Help & Support'}>
          <HelpIcon />
        </TopMenuIcon>
      </StyledTopMenuIconWrapper>
    </Link>
  );
};

export default React.memo(Help);
