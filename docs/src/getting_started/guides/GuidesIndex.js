import React, { PropTypes } from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { API_VERSION } from '~/constants';


export default function GuidesIndex(props) {
  const { route } = props;
  const { crumbs } = route;

  return (
    <div className="EndpointIndex">
      <div className="EndpointIndex-header">
        <div className="Endpoint-breadcrumbsContainer">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <h1>Guides</h1>
      </div>
      <div>
        <section>
          <h2>cURL</h2>
          <Table
            className="Table--secondary"
            columns={[
              {
                cellComponent: LinkCell,
                textKey: 'path',
                label: 'Title',
                headerClassName: 'SectionColumn',
                hrefFn: function (subPage) {
                  return subPage.href;
                },
              },
              { label: 'Description', dataKey: 'description' },
            ]}
            data={[
              {
                href: `/${API_VERSION}/guides/curl/testing-with-curl`,
                path: 'Testing with cURL',
                description: 'A crash course on cURL and how to use it to try out the API.',
              },
              {
                href: `/${API_VERSION}/guides/curl/creating-a-linode`,
                path: 'Creating a Linode',
                description: 'Starting from nothing and ending with a running Linode instance.',
              },
            ]}
          />
        </section>
        <section>
          <h2>Python</h2>
          <div className="EndpointIndex-group">
            <Table
              className="Table--secondary"
              columns={[
                {
                  cellComponent: LinkCell,
                  textKey: 'path',
                  label: 'Title',
                  headerClassName: 'SectionColumn',
                  hrefFn: function (subPage) {
                    return subPage.href;
                  },
                },
                { label: 'Description', dataKey: 'description' },
              ]}
              data={[
                {
                  href: `/${API_VERSION}/guides/python/getting-started`,
                  path: 'Getting started with Linode Python',
                  description: 'A quick guide on getting started with the official Linode ' +
                  'Python wrapper',
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
        </section>
      </div>
    </div>
  );
}

GuidesIndex.propTypes = {
  route: PropTypes.object,
};
