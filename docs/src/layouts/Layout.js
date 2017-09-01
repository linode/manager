import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { Header } from 'linode-components/navigation';

import { LinodeLogoImgSrc } from '~/assets';
import { API_VERSION } from '~/constants';
import { VerticalNav, VerticalNavSection } from '~/components';


export default class Layout extends Component {
  constructor() {
    super();
    document.addEventListener('click', this.toggleVerticalNav.bind(this));
    this.state = { verticalNav: false };
  }

  toggleVerticalNav(e) {
    if (e.target.id === 'ToggleNavButton' || e.target.id === 'ToggleNavButtonIcon') {
      this.setState({ verticalNav: !this.state.verticalNav });
    }
    if (e.target.id.match(/NavLink-.*/)) {
      this.setState({ verticalNav: false });
    }
  }

  render() {
    const { route } = this.props;
    const { verticalNav } = this.state;
    const { childParentMap, indices } = route;
    const path = this.props.location.pathname + this.props.location.hash;

    const verticalNavShow = verticalNav ?
      'Layout-navigationContainer--show' : 'Layout-navigationContainer--hide';

    return (
      <div className="Docs Layout">
        <Header>
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
          <span className="MainHeader-title">Developers</span>
          <button
            className="ToggleNav navbar-toggler navbar-toggler-right collapsed"
            type="button"
            id="ToggleNavButton"
          >
            <i className="fa fa-bars" id="ToggleNavButtonIcon"></i>
          </button>
        </Header>
        <div className="Layout-container container">
          <div className={`Layout-navigationContainer ${verticalNavShow}`}>
            <VerticalNav>
              <VerticalNavSection
                title="Getting Started"
                checkActiveItem={function (path, href) {
                  return (href === path || href === childParentMap[path]);
                }}
                path={path}
                navItems={[
                  { label: 'Introduction', href: `/${API_VERSION}/introduction` },
                  { label: 'Access', href: `/${API_VERSION}/access` },
                  { label: 'Pagination', href: `/${API_VERSION}/pagination` },
                  { label: 'Filtering & Sorting', href: `/${API_VERSION}/filtering` },
                  { label: 'Errors', href: `/${API_VERSION}/errors` },
                  { label: 'Guides', href: `/${API_VERSION}/guides` },
                ]}
              />
              <VerticalNavSection
                title="Reference"
                checkActiveItem={function (path, href) {
                  return (href === path || href === childParentMap[path]);
                }}
                path={path}
                navItems={indices.map(endpointIndex => ({
                  ...endpointIndex, label: endpointIndex.name, href: endpointIndex.routePath,
                }))}
              />
              <VerticalNavSection
                title="Libraries"
                checkActiveItem={function (path, href) {
                  return (href === path || href === childParentMap[path]);
                }}
                path={path}
                navItems={[
                  { label: 'Python', href: `/${API_VERSION}/libraries/python` },
                ]}
              />
            </VerticalNav>
          </div>
          <div className="Layout-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node,
  route: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    hash: PropTypes.string,
  }),
};
