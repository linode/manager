import React from 'react';
import { Link } from 'react-router';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { default as Method } from './Method';


export default function Endpoint(props) {
  const { route } = props;
  const { crumbs, endpoint } = route;
  const { authenticated, description, methods, path, resource } = endpoint;

  return (
    <div className="Endpoint">
      <div className="Endpoint-header">
        <div className="Endpoint-breadcrumbsContainer">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <div className="Title">
          <div className="Title-heading clearfix">
            <h1>{path}</h1>
            {authenticated ? <div className="float-sm-right"><small className="text-muted"><i className="fa fa-lock"></i> Authenticated</small></div> : null}
          </div>
          <p>{description}</p>
        </div>
        <div className="Endpoint-methods">
          <span className="Endpoint-methodsLabel">JUMP TO:</span>
          <ul className="Endpoint-methodsList">
            {methods.map(function(method, index) {
              return (
                <li key={index}>
                  <a href={`#${method.name}`}>{method.name}</a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="divider"></div>
      <div className="Endpoint-body">
        {methods.map(function(method, index) {
          return (
            <div>
              <Method key={index} method={method} />
              {index < (methods.length - 1) ? <div className="divider"></div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
