import React, { PropTypes } from 'react';

import { Link } from 'react-router';

export default function Sidebar(props) {
  const { path, links } = props;

  const defaultLinks = [
    ['services', [
      { icon: 'cubes', name: 'Linodes', link: '/linodes' },
      { icon: 'code-fork', name: 'NodeBalancers', link: '/nodebalancers' },
      { icon: 'share-alt', name: 'Domains', link: '/domains' },
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
