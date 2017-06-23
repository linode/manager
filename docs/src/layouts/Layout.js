import React, { Component } from 'react';
import { Link } from 'react-router';

import { Header } from 'linode-components/navigation';

import { LinodeLogoImgSrc } from '~/assets';

import { API_VERSION } from '~/constants';


export default class Layout extends Component {
  constructor() {
    super();
    document.addEventListener('click', this.toggleVerticalNav.bind(this));
    this.renderNavListItems = this.renderNavListItems.bind(this);
    this.state = { verticalNav: false };
  }

  renderNavListItems(items, path, childParentMap) {
    return items.map((item, index) => {
      return (
        <li
          className={(item.href === path || item.href === childParentMap[path]) ? 'active': ''}
          key={index}
        >
          <Link to={item.href} id={`NavLink-${index}`}>{item.label}</Link>
        </li>
      )
    });
  }

  toggleVerticalNav(e) {
    if (e.target.id === 'ToggleNavButton' || e.target.id === 'ToggleNavButtonIcon') {
      this.setState({ verticalNav: !this.state.verticalNav });
      console.log('toggle button clicked');
    }
    if (e.target.id.match(/NavLink-.*/)) {
      this.setState({ verticalNav: false });
    }
  }

  render() {
    const { route } = this.props;
    const { verticalNav } = this.state;
    const { childParentMap, endpoints } = route;
    const path = this.props.location.pathname;

    const miniHeader = (
      <div className="MiniHeader-text">
      This is the early-access Linode APIv4 documentation.
      Click <a href="https://linode.com/api">here</a> for APIv3 documentation.
      </div>
    );

    const verticalNavShow = verticalNav ? 'Layout-navigationContainer-Show' : 'Layout-navigationContainer-Hide';

    return (
      <div className="Docs Layout">
        <Header miniHeader={miniHeader}>
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
          <button className="ToggleNav navbar-toggler navbar-toggler-right collapsed" type="button" id="ToggleNavButton">
            <i className="fa fa-bars" id="ToggleNavButtonIcon"></i>
          </button>
        </Header>
        <div className="Layout-container container">
          <div className={`Layout-navigationContainer ${verticalNavShow}`}>
            <div className="VerticalNav">
              <div className="VerticalNav-section">
                <h3>Getting Started</h3>
                <ul>
                  {this.renderNavListItems([
                    { label: 'Introduction', href: `/${API_VERSION}/introduction` },
                    { label: 'Access', href: `/${API_VERSION}/access` },
                    { label: 'Pagination', href: `/${API_VERSION}/pagination` },
                    { label: 'Filtering & Sorting', href: `/${API_VERSION}/filtering` },
                    { label: 'Errors', href: `/${API_VERSION}/errors` },
                    { label: 'Guides', href: `/${API_VERSION}/guides` },
                  ], path, childParentMap)}
                </ul>
              </div>
              <div className="VerticalNav-section">
                <h3>Reference</h3>
                <ul>
                  {this.renderNavListItems(endpoints.map(function(endpoint, index) {
                    return { label: endpoint.name, href: endpoint.routePath };
                  }), path, childParentMap)}
                </ul>
              </div>
              <div className="VerticalNav-section">
                <h3>Libraries</h3>
                <ul>
                  {this.renderNavListItems([
                    { label: 'Python', href: `/${API_VERSION}/libraries/python` }
                  ], path, childParentMap)}
                </ul>
              </div>
            </div>
          </div>
          <div className="Layout-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
};
