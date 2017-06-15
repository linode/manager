import React from 'react';
import { Link } from 'react-router';

import { Header } from 'linode-components/navigation';

import { LinodeLogoImgSrc } from '~/assets';

import { API_VERSION } from '~/constants';


export default function Layout(props) {
  const { route } = props;
  const { endpoints } = route;

  const miniHeader = (
    <div className="MiniHeader-text">
      This is the beta Linode APIv4 documentation.
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
                <li><Link to={`/${API_VERSION}/introduction`}>Introduction</Link></li>
                <li><Link to={`/${API_VERSION}/access`}>Access</Link></li>
                <li><Link to={`/${API_VERSION}/pagination`}>Pagination</Link></li>
                <li><Link to={`/${API_VERSION}/filtering`}>Filtering &amp; Sorting</Link></li>
                <li><Link to={`/${API_VERSION}/errors`}>Errors</Link></li>
                <li><Link to={`/${API_VERSION}/guides`}>Guides</Link></li>
              </ul>
            </div>
            <div className="VerticalNav-section">
              <h3>Reference</h3>
              <ul>
                {endpoints.map(function(endpoint, index) {
                  return (<li key={index}><Link to={endpoint.routePath}>{endpoint.name}</Link></li>);
                })}
              </ul>
            </div>
            <div className="VerticalNav-section">
              <h3>Libraries</h3>
              <ul>
                <li><Link to={`/${API_VERSION}/libraries/python`}>Python</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="Layout-content">
          {props.children}
        </div>
      </div>
    </div>
  );
};
