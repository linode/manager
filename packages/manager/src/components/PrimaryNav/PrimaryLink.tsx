import { BetaChip } from '@linode/ui';
import * as React from 'react';

import { StyledActiveLink, StyledPrimaryLinkBox } from './PrimaryNav.styles';
import { linkIsActive } from './utils';

import type { NavEntity } from './PrimaryNav';

export interface PrimaryLink {
  activeLinks?: Array<string>;
  attr?: { [key: string]: any };
  betaChipClassName?: string;
  display: NavEntity;
  hide?: boolean;
  href: string;
  icon?: JSX.Element;
  isBeta?: boolean;
  onClick?: (e: React.ChangeEvent<any>) => void;
}

interface PrimaryLinkProps extends PrimaryLink {
  closeMenu: () => void;
  isBeta?: boolean;
  isCollapsed: boolean;
  locationPathname: string;
  locationSearch: string;
}

const PrimaryLink = React.memo((props: PrimaryLinkProps) => {
  const {
    activeLinks,
    attr,
    betaChipClassName,
    closeMenu,
    display,
    href,
    icon,
    isBeta,
    isCollapsed,
    locationPathname,
    locationSearch,
    onClick,
  } = props;

  const isActiveLink = Boolean(
    linkIsActive(href, locationSearch, locationPathname, activeLinks)
  );

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
    >
      {icon && (
        <div aria-hidden className="icon">
          {icon}
        </div>
      )}
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
