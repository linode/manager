import React from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';


export default function EndpointIndex(props) {
  const { route } = props;
  const { crumbs, endpoint } = route;
  endpoint.endpoints = endpoint.endpoints.sort(function(a, b) {
    return a.base_path - b.base_path;
  });
  return (
    <div className="EndpointIndex">
      <div className="EndpointIndex-header">
        <div className="EndpointIndex-breadcrumbsContainer">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <h1>{endpoint.name}</h1>
        {!endpoint.description ? null : <p>{endpoint.description}</p>}
      </div>
      <div>
        {endpoint.endpoints.map(function(endpointSection) {
          endpointSection.endpoints = endpointSection.endpoints.sort(function(a, b) {
            if ( a.path < b.path) return -1;
            if ( a.path > b.path) return 1;
            return 0;
          });
          return (
            <div className="EndpointIndex-group">
              <h3>{endpointSection.name}</h3>
              <Table
                className="Table--secondary"
                columns={[
                  {
                    cellComponent: LinkCell,
                    textKey: 'path',
                    label: 'Endpoint',
                    headerClassName: 'EndpointColumn',
                    hrefFn: function(childEndpoint) {
                      return childEndpoint.routePath;
                    }
                  },
                  { label: 'Description', dataKey: 'description' },
                ]}
                data={endpointSection.endpoints}
                noDataMessage="No endpoints documented."
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
