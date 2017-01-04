import React, { PropTypes } from 'react';

import { Link } from '~/components/Link';

const makeLink = (link, child) => (
  link.indexOf('http') === 0 ?
    <a key={link} href={link}>{child}</a> :
    <Link key={link} to={link}>{child}</Link>
);

export default function StackedNav(props) {
  return (
    <div className="sidebar">
      <ul className="list-unstyled">
        {
          props.navItems.map(([section, links]) =>
            <section key={section}>
              <header>
                <h3>{section}</h3>
              </header>
              {
                links.map(({ icon, name, link }) =>
                  makeLink(link, (
                    <li className={props.path.indexOf(link) === 0 ? 'active' : ''} key={link}>
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

StackedNav.propTypes = {
  sidebarLinks: PropTypes.array
};

StackedNav.defaultProps = {

};
