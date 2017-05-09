import React from 'react';
import { Link } from 'react-router';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { default as Method } from './Method';


export default function Endpoint(props) {
  const { route } = props;
  const { crumbs, endpoint } = route;
  const { description, methods, path, resource } = endpoint;

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
