import * as React from 'react';
import Community from 'src/assets/icons/community_nav.svg';
import { Link } from 'src/components/Link';
import TopMenuIcon from './TopMenuIcon';
import { StyledTopMenuIconWrapper } from './TopMenuIcon';

type Props = {
  className?: string;
};

export const Help = ({ className }: Props) => {
  return (
    <Link
      className={className}
      aria-label="Link to Linode Community site"
      to="https://linode.com/community"
    >
      <StyledTopMenuIconWrapper>
        <TopMenuIcon title="Linode Cloud Community">
          <Community />
        </TopMenuIcon>
      </StyledTopMenuIconWrapper>
    </Link>
  );
};

export default React.memo(Help);
