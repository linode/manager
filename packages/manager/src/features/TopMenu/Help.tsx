import * as React from 'react';
import TooltipIcon from 'src/assets/icons/get_help.svg';
import Link from 'src/components/Link';
import TopMenuIcon from './TopMenuIcon';
import { StyledTopMenuIconWrapper } from './TopMenuIcon';

export const Help = () => {
  return (
    <Link aria-label="Link to Linode Support" to="/support" title="Help">
      <TopMenuIcon title={'Help & Support'}>
        <StyledTopMenuIconWrapper
          sx={{
            marginLeft: [null, null, '8px'],
          }}
        >
          <TooltipIcon status="help" />
        </StyledTopMenuIconWrapper>
      </TopMenuIcon>
    </Link>
  );
};

export default React.memo(Help);
