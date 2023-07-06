import * as React from 'react';
import HelpSVGIcon from 'src/assets/icons/get_help.svg';
import { Link } from 'src/components/Link';
import { TopMenuIcon, StyledTopMenuIconWrapper } from './TopMenuIcon';
import { Button } from 'src/components/Button/Button';

export const Help = () => {
  return (
    <TopMenuIcon title="Help & Support">
      <Button
        aria-label="Help & Support"
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
        <Link aria-label="Link to Linode Support" to="/support">
          <StyledTopMenuIconWrapper sx={{ marginLeft: [null, null, '8px'] }}>
            <HelpSVGIcon status="help" />
          </StyledTopMenuIconWrapper>
        </Link>
      </Button>
    </TopMenuIcon>
  );
};
