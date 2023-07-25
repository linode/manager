import * as React from 'react';

import Help from 'src/assets/icons/help.svg';

import { NavItem, PrimaryLink } from './NavItem';

interface Props {
  closeMenu: () => void;
  dividerClasses: string;
  isCollapsed?: boolean;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
}

export const AdditionalMenuItems = React.memo((props: Props) => {
  const { isCollapsed } = props;
  const links: PrimaryLink[] = [
    {
      QAKey: 'help',
      display: 'Get Help',
      href: '/support',
      icon: <Help className="small wBorder" />,
    },
  ];

  return (
    <React.Fragment>
      {links.map((eachLink) => {
        return (
          <NavItem
            {...eachLink}
            {...props}
            isCollapsed={isCollapsed}
            key={eachLink.QAKey}
          />
        );
      })}
    </React.Fragment>
  );
});
