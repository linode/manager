import * as React from 'react';
import Community from 'src/assets/icons/community_nav.svg';
import Link from 'src/components/Link';
import TopMenuIcon from './TopMenuIcon';
import { StyledTopMenuSvgWrapper } from './TopMenuIcon';

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
      <TopMenuIcon title="Linode Cloud Community">
        <StyledTopMenuSvgWrapper>
          <Community />
        </StyledTopMenuSvgWrapper>
      </TopMenuIcon>
    </Link>
  );
};

export default React.memo(Help);
