import React from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';


export default function EndpointIndex(props) {
  const { route } = props;
  const { crumbs, endpoint, title } = route;

  return (
    <div className="EndpointIndex">
      <div className="EndpointIndex-header">
        <div className="EndpointIndex-breadcrumbsContainer">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <h2>{title}</h2>
        <p>{endpoint.description}</p>
      </div>
      <div>
        <Table
          className="Table--secondary"
          columns={[
            {
              cellComponent: LinkCell,
              textKey: 'path',
              label: 'Endpoint',
              hrefFn: function(record) {
                return '#';
              }
            },
            { label: 'Description', dataKey: 'description' },
            {} // empty until fix
          ]}
          data={endpoint.endpoints}
        />
      </div>
    </div>
  );
}
