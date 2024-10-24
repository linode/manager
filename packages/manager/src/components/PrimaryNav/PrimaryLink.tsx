import { BetaChip } from '@linode/ui';
import * as React from 'react';

import { StyledActiveLink, StyledPrimaryLinkBox } from './PrimaryNav.styles';

import type { NavEntity } from './PrimaryNav';

export interface PrimaryLink {
  activeLinks?: Array<string>;
  attr?: { [key: string]: any };
  betaChipClassName?: string;
  display: NavEntity;
  hide?: boolean;
  href: string;
  isBeta?: boolean;
  onClick?: (e: React.ChangeEvent<any>) => void;
}

interface PrimaryLinkProps extends PrimaryLink {
  closeMenu: () => void;
  isActiveLink: boolean;
  isBeta?: boolean;
  isCollapsed: boolean;
}

const PrimaryLink = React.memo((props: PrimaryLinkProps) => {
  const {
    attr,
    betaChipClassName,
    closeMenu,
    display,
    href,
    isActiveLink,
    isBeta,
    isCollapsed,
    onClick,
  } = props;

  return (
    <StyledActiveLink
      onClick={(e: React.ChangeEvent<any>) => {
        closeMenu();
        if (onClick) {
          onClick(e);
        }
      }}
      to={href}
      {...attr}
      aria-current={isActiveLink}
      data-testid={`menu-item-${display}`}
      isActiveLink={isActiveLink}
      isCollapsed={isCollapsed}
    >
      <StyledPrimaryLinkBox
        className="primaryNavLink"
        isCollapsed={isCollapsed}
      >
        {display}
        {isBeta ? (
          <BetaChip
            className={`${betaChipClassName ? betaChipClassName : ''}`}
            color="primary"
            component="span"
          />
        ) : null}
      </StyledPrimaryLinkBox>
    </StyledActiveLink>
  );
});

export default PrimaryLink;
