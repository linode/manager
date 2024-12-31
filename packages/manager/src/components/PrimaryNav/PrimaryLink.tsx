import { BetaChip } from '@linode/ui';
import * as React from 'react';

import {
  StyledActiveLink,
  StyledChip,
  StyledPrimaryLinkBox,
} from './PrimaryNav.styles';

import type { NavEntity } from './PrimaryNav';
import type { CreateEntity } from 'src/features/TopMenu/CreateMenu/CreateMenu';

export interface BaseNavLink {
  attr?: { [key: string]: any };
  display: CreateEntity | NavEntity;
  hide?: boolean;
  href: string;
}

export interface PrimaryLink extends BaseNavLink {
  activeLinks?: Array<string>;
  betaChipClassName?: string;
  isBeta?: boolean;
  label?: string;
  onClick?: (e: React.ChangeEvent<any>) => void;
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
    href,
    isActiveLink,
    isBeta,
    isCollapsed,
    label,
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
      <StyledChip isActiveLink={isActiveLink} label={label} size="small" />
      <StyledPrimaryLinkBox
        className="primaryNavLink"
        isActiveLink={isActiveLink}
        isCollapsed={isCollapsed}
      >
        {display}
        {isBeta ? (
          <BetaChip
            className={`${betaChipClassName ?? ''}`}
            color="primary"
            component="span"
          />
        ) : null}
      </StyledPrimaryLinkBox>
    </StyledActiveLink>
  );
});

export default PrimaryLink;
