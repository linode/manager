import React from 'react';
import { PropTypes } from 'prop-types';

import { Link } from 'react-router';


const navigationItems = [
  { href: '/styleguide', text: 'Overview' },
  { href: '/styleguide/colors', text: 'Colors' },
  { href: '/styleguide/typography', text: 'Typography' },
  { href: '/styleguide/iconography', text: 'Iconography' },
  { href: '/styleguide/writing-style', text: 'Writing Style' },
  { href: '/styleguide/buttons', text: 'Buttons' },
  { href: '/styleguide/navigation', text: 'Navigation' },
  { href: '/styleguide/tabs', text: 'Tabs' },
  { href: '/styleguide/forms', text: 'Forms' },
  { href: '/styleguide/modals', text: 'Modals' },
  { href: '/styleguide/lists', text: 'Lists' },
];

function createNavigationItems() {
  const currentPathname = location.pathname;

  return navigationItems.map((item) => {
    const className = item.href === currentPathname ? 'active' : null;
    return <li key={item.href}><Link to={item.href} className={className}>{item.text}</Link></li>;
  });
}

export function StyleguideNav(props) {
  return (
    <div className="Styleguide-nav col-sm-2">
      <ul>{createNavigationItems()}</ul>
    </div>
  );
}

StyleguideNav.propTypes = {
  children: PropTypes.node,
};

export default StyleguideNav;
