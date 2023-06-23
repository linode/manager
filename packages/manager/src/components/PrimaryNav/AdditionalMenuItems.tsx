import * as React from 'react';
import { NavItem, PrimaryLink } from './NavItem';

import Help from 'src/assets/icons/help.svg';

interface Props {
  closeMenu: () => void;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
  dividerClasses: string;
  isCollapsed?: boolean;
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
            key={eachLink.QAKey}
            isCollapsed={isCollapsed}
          />
        );
      })}
    </React.Fragment>
  );
});
