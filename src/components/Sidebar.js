import React, { PropTypes } from 'react';

import { Link } from '~/components/Link';
import { LOGIN_ROOT } from '~/constants';

export default function Sidebar(props) {
  const { path, links } = props;

  const defaultLinks = [
    { icon: 'cubes', name: 'Linodes', link: '/linodes' },
    { icon: 'code-fork', name: 'NodeBalancers', link: '/nodebalancers' },
    { icon: 'bar-chart-o', name: 'Longview', link: '/longview' },
    { icon: 'share-alt', name: 'DNS Manager', link: '/dnsmanager' },
    { icon: 'user', name: 'Account', link: `${LOGIN_ROOT}/account` },
    { icon: 'users', name: 'Support', link: '/support' },
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
          sidebarLinks.map(({ icon, name, link }) =>
            makeLink(link, (
              <li className={path.indexOf(link) === 0 ? 'active' : ''}>
                <span className={`fa fa-${icon}`} />
                <span>{name}</span>
              </li>
            )))
        }
      </ul>
    </div>
  );
}

Sidebar.propTypes = {
  path: PropTypes.string,
  links: PropTypes.array,
};
