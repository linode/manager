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
        <h2>{endpoint.name}</h2>
        <p>{endpoint.description}</p>
      </div>
      <div>
        {endpoint.formattedEndpoints.map(function(endpointSection) {
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
                data={endpointSection.formattedEndpoints}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
