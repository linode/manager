import React, { Component } from 'react';
import { Link } from 'react-router';

import { Header } from 'linode-components/navigation';

import { LinodeLogoImgSrc } from '~/assets';

import { API_VERSION } from '~/constants';


export default class Layout extends Component {
  constructor() {
    super();

    this.renderNavListItems = this.renderNavListItems.bind(this);
  }

  renderNavListItems(items, path) {
    return items.map((item, index) => {
      return (
        <li
          className={item.href === path ? 'active': ''}
          key={index}
        >
          <Link to={item.href}>{item.label}</Link>
        </li>
      )
    });
  }

  render() {
    const { route } = this.props;
    const { endpoints } = route;
    const path = this.props.location.pathname;

    const miniHeader = (
      <div className="MiniHeader-text">
      This is the early-access Linode APIv4 documentation.
      Click <a href="https://linode.com/api">here</a> for APIv3 documentation.
      </div>
    );

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
        </Header>
        <div className="Layout-container container">
          <div className="Layout-navigationContainer">
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
                  ], path)}
                </ul>
              </div>
              <div className="VerticalNav-section">
                <h3>Reference</h3>
                <ul>
                  {this.renderNavListItems(endpoints.map(function(endpoint, index) {
                    return { label: endpoint.name, href: endpoint.routePath };
                  }), path)}
                </ul>
              </div>
              <div className="VerticalNav-section">
                <h3>Libraries</h3>
                <ul>
                  {this.renderNavListItems([
                    { label: 'Python', href: `/${API_VERSION}/libraries/python` }
                  ], path)}
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
