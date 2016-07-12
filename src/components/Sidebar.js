import React from 'react';
import { Link } from 'react-router';

export default function Sidebar() {
  const links = [
    { icon: 'th', name: 'Linodes', link: '/linodes' },
    { icon: 'code-fork', name: 'NodeBalancers', link: '/nodebalancers' },
    { icon: 'bar-chart-o', name: 'Longview', link: '/longview' },
    { icon: 'share-alt', name: 'DNS Manager', link: '/dnsmanager' },
    { icon: 'user', name: 'Account', link: '/account' },
    { icon: 'users', name: 'Support', link: '/support' },
  ];

  return (
    <div className="sidebar">
      <ul className="list-unstyled">
      {
        links.map(({ icon, name, link }) =>
          <li key={name}>
            <Link to={link}>
              <span className={`fa fa-${icon}`} />
              <span>{name}</span>
            </Link>
          </li>
        )
      }
      </ul>
    </div>
  );
}
