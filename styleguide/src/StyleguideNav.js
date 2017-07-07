import React from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router';

import { VerticalNav, VerticalNavSection } from 'linode-components/navigation';


const navigationItems = [
  { href: '/styleguide', label: 'Overview' },
  { href: '/styleguide/colors', label: 'Colors' },
  { href: '/styleguide/typography', label: 'Typography' },
  { href: '/styleguide/iconography', label: 'Iconography' },
  { href: '/styleguide/writing-style', label: 'Writing Style' },
  { href: '/styleguide/buttons', label: 'Buttons' },
  { href: '/styleguide/navigation', label: 'Navigation' },
  { href: '/styleguide/tabs', label: 'Tabs' },
  { href: '/styleguide/forms', label: 'Forms' },
  { href: '/styleguide/modals', label: 'Modals' },
  { href: '/styleguide/lists', label: 'Lists' },
];

function createNavigationItems() {
  const currentPathname = location.pathname;

  return navigationItems.map((item) => {
    const className = item.href === currentPathname ? 'active' : null;
    return <li key={item.href}><Link to={item.href} className={className}>{item.text}</Link></li>;
  });
}

export function StyleguideNav(props) {
  const path = location.pathname.match(/overview/) ? '/styleguide' : location.pathname;
  return (
    <VerticalNav>
      <VerticalNavSection
        title=""
        path={path}
        navItems={navigationItems}
      />
    </VerticalNav>
  );
}

StyleguideNav.propTypes = {
  children: PropTypes.node,
};

export default StyleguideNav;
