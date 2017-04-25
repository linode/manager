import React from 'react';
import { Link } from 'react-router';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { default as Method } from './Method';


export default function Endpoint(props) {
  const { route } = props;
  const { endpoint } = route;
  const { crumbs, description, methods, path } = endpoint;

  return (
    <div className="Endpoint">
      <div className="Endpoint-header">
        <div className="Endpoint-breadcrumbsContainer">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <div className="Endpoint-title">
          <h1>{path}</h1>
          <p>{description}</p>
        </div>
        <div className="Endpoint-methods">
          <span className="Endpoint-methodsLabel">JUMP TO:</span>
          <ul className="Endpoint-methodsList">
            {methods.map(function(method, index) {
              return (
                <li key={index}>
                  <Link to={`#${method.name}`}>{method.name}</Link>
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
