import { BetaChip } from '@linode/ui';
import * as React from 'react';

import { StyledActiveLink, StyledPrimaryLinkBox } from './PrimaryNav.styles';

import type { NavEntity } from './PrimaryNav';
import type { LinkProps } from '@tanstack/react-router';
import type { CreateEntity } from 'src/features/TopMenu/CreateMenu/CreateMenu';

export interface BaseNavLink {
  attr?: { [key: string]: unknown };
  display: CreateEntity | NavEntity;
  hide?: boolean;
  to: LinkProps['to'];
}

export interface PrimaryLink extends BaseNavLink {
  betaChipClassName?: string;
  isBeta?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface PrimaryLinkProps extends PrimaryLink {
  closeMenu: () => void;
  isActiveLink: boolean;
  isCollapsed: boolean;
}

const PrimaryLink = React.memo((props: PrimaryLinkProps) => {
  const {
    attr,
    betaChipClassName,
    closeMenu,
    display,
    to,
    isActiveLink,
    isBeta,
    isCollapsed,
    onClick,
  } = props;

  return (
    <StyledActiveLink
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        closeMenu();
        if (onClick) {
          onClick(e);
        }
      }}
      to={to}
      {...attr}
      aria-current={isActiveLink}
      data-testid={`menu-item-${display}`}
      isActiveLink={isActiveLink}
      isCollapsed={isCollapsed}
    >
      <StyledPrimaryLinkBox
        className="primaryNavLink"
        isActiveLink={isActiveLink}
        isCollapsed={isCollapsed}
      >
        {display}
        {isBeta ? (
          <BetaChip className={`${betaChipClassName ?? ''}`} component="span" />
        ) : null}
      </StyledPrimaryLinkBox>
    </StyledActiveLink>
  );
});

export default PrimaryLink;
