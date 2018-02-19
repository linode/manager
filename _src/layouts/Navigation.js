import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { LinodeLogoImgSrc } from '~/assets';
import NavigationLink from '~/layouts/NavigationLink';
import Notifications from '~/components/notifications';
import Session from '~/components/session';
import { isPathOneOf } from '~/utilities';

const Navigation = ({ location: { pathname } }) => {
  const highlight = isPathOneOf(['/stackscripts', '/images'], pathname);

  const links = [
    { linkClass: 'MainHeader-link', to: '/linodes', label: 'Linodes', highlight, key: 0 },
    { linkClass: 'MainHeader-link', to: '/volumes', label: 'Volumes', key: 1 },
    { linkClass: 'MainHeader-link', to: '/nodebalancers', label: 'NodeBalancers', key: 2 },
    { linkClass: 'MainHeader-link', to: '/domains', label: 'Domains', key: 3 },
    { linkClass: 'MainHeader-link', to: '/support', label: 'Support', key: 4 },
  ];

  return (
    <div className="MainHeader">
      <div className="container">
        <div className="MainHeader-brand">
          <Link to="/">
            <span className="MainHeader-logo">
              <img
                src={LinodeLogoImgSrc}
                alt="Linode Logo"
                height={40}
                width={35}
              />
            </span>
          </Link>
        </div>
        {links.map((props) => React.createElement(NavigationLink, props))}
        <Session />
        <Notifications />
      </div>
    </div>
  );
};

Navigation.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

export default withRouter(Navigation);
