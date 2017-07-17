import React from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { API_VERSION } from '~/constants';

import { default as python } from '~/python';


export default function Python(props) {
  const { route } = props;
  const { pythonDataObjects } = route;
  const { pythonDataTitles, pythonClientObjectTitles, pythonAPITitles } = pythonDataObjects;
  return(
    <section className="Article">
      <div className="EndpointIndex-header">
        <div className="Title">
          <div className="Title-heading clearfix">
            <h1>Python Library</h1>
            <div className="float-sm-right">
              <span className="GithubLink">
                See this project on <a
                      href="https://github.com/linode/python-linode-api"
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                    >
                  <i className="fa fa-github"></i> GitHub
                </a>.
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="EndpointIndex-group">
        <h3>Client Objects</h3>
        <Table
          className="Table--secondary"
          columns={[
            {
              cellComponent: LinkCell,
              textKey: 'path',
              label: 'Object',
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
              label: 'Object',
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
