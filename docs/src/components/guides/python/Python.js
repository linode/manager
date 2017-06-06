import React from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { API_VERSION } from '~/constants';

import { python } from '~/data/python';

export default function Python(props) {
  const { route } = props;
  const { pythonDataObjects } = route;
  const { pythonDataTitles, pythonClientObjectTitles, pythonAPITitles } = pythonDataObjects;
  return(
    <section className="Article">
      <div className="EndpointIndex-header">
        <h1>Python Guide</h1>
      </div>
      <div className="EndpointIndex-group">
        <h3>Getting Started</h3>
        <Table
          className="Table--secondary"
          columns={[
            {
              cellComponent: LinkCell,
              textKey: 'path',
              label: 'Section',
              headerClassName: 'SectionColumn',
              hrefFn: function(subPage) {
                return subPage.href;
              }
            },
            { label: 'Description', dataKey: 'description' },
          ]}
          data={[
            {
              href: `/${API_VERSION}/guides/python/introduction`,
              path: 'Introduction',
              description: 'The introductory summary to using the Python guide',
            },
            {
              href: `/${API_VERSION}/guides/python/basic-setup`,
              path: 'Basic Setup',
              description: 'Setting up the official Linode Python library',
            },
            {
              href: `/${API_VERSION}/guides/python/oauth-workflow`,
              path: 'OAuth Workflow',
              description: 'A description of the OAuth workflow for the Linode Python library',
            },
            {
              href: `/${API_VERSION}/guides/python/core-concepts`,
              path: 'Core Concepts',
              description: 'Core concepts for using the Linode Python library',
            },
          ]}
        />
      </div>
      <div className="EndpointIndex-group">
        <h3>Client Objects</h3>
        <Table
          className="Table--secondary"
          columns={[
            {
              cellComponent: LinkCell,
              textKey: 'path',
              label: 'Section',
              headerClassName: 'SectionColumn',
              hrefFn: function(subPage) {
                return subPage.href;
              }
            },
            { label: 'Description', dataKey: 'description' },
          ]}
          data={[
            ...pythonClientObjectTitles,
          ]}
        />
      </div>
      <div className="EndpointIndex-group">
        <h3>API Objects</h3>
        <Table
          className="Table--secondary"
          columns={[
            {
              cellComponent: LinkCell,
              textKey: 'path',
              label: 'Section',
              headerClassName: 'SectionColumn',
              hrefFn: function(subPage) {
                return subPage.href;
              }
            },
            { label: 'Description', dataKey: 'description' },
          ]}
          data={[
            ...pythonAPITitles,
          ]}
        />
      </div>
    </section>
  );
}
