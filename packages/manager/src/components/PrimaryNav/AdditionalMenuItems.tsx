import * as React from 'react';
import { compose } from 'recompose';
import NavItem, { PrimaryLink } from './NavItem';

import Help from 'src/assets/icons/help.svg';
// import { sendAdaEvent } from 'src/utilities/ga';

interface Props {
  closeMenu: () => void;
  linkClasses: (href?: string) => string;
  listItemClasses: string;
  dividerClasses: string;
  isCollapsed?: boolean;
}

type CombinedProps = Props;

const AdditionalMenuItems: React.FC<CombinedProps> = (props) => {
  const { isCollapsed } = props;
  const links: PrimaryLink[] = [
    {
      display: 'Get Help',
      href: '/support',
      QAKey: 'help',
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
};

export default compose<CombinedProps, Props>(React.memo)(AdditionalMenuItems);
