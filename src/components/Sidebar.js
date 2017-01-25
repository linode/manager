import React, { PropTypes } from 'react';

import { Link } from '~/components/Link';
import { LOGIN_ROOT } from '~/constants';

export default function Sidebar(props) {
  const { path, links } = props;

  const defaultLinks = [
    ['services', [
      { icon: 'cubes', name: 'Linodes', link: '/linodes' },
      { icon: 'code-fork', name: 'NodeBalancers', link: '/nodebalancers' },
      { icon: 'bar-chart-o', name: 'Longview', link: '/longview' },
      { icon: 'share-alt', name: 'DNS Manager', link: '/dnsmanager' },
    ]],
    ['account', [
      { icon: 'user', name: 'My profile', link: `/profile` },
      { icon: 'users', name: 'Users', link: `${LOGIN_ROOT}/users` },
      { icon: 'dollar', name: 'Billing', link: `${LOGIN_ROOT}/billing` },
      { icon: 'gear', name: 'Settings', link: `${LOGIN_ROOT}/settings` },
      { icon: 'support', name: 'Support', link: '/support' },
    ]],
    ['community', [
      { icon: 'university', name: 'Guides', link: 'https://linode.com/docs' },
      { icon: 'comments', name: 'Forum', link: 'https://forum.linode.com' },
      { icon: 'book', name: 'Developers', link: 'https://developers.linode.com' },
    ]],
  ];

  const makeLink = (link, child) => (
    link.indexOf('http') === 0 ?
      <a key={link} href={link}>{child}</a> :
      <Link key={link} to={link}>{child}</Link>
  );

  const sidebarLinks = links || defaultLinks;
  return (
    <div className="sidebar">
      <ul className="list-unstyled">
        {
          sidebarLinks.map(([section, links]) =>
            <section key={section}>
              <header>
                <h3>{section}</h3>
              </header>
              {
                links.map(({ icon, name, link }) =>
                  makeLink(link, (
                    <li className={path.indexOf(link) === 0 ? 'active' : ''} key={link}>
                      <span className={`fa fa-${icon}`} />
                      <span>{name}</span>
                    </li>
                  )))
              }
            </section>)
        }
      </ul>
    </div>
  );
}

Sidebar.propTypes = {
  path: PropTypes.string,
  links: PropTypes.array,
};
