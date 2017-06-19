import React from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';


export default function EndpointIndex(props) {
  const { route } = props;
  const { crumbs, endpoint } = route;

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
