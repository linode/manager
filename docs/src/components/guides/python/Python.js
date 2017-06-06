import React from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

import { API_VERSION } from '~/constants';


export default function Python() {
  return(
    <section className="Article">
      <h1>Python Guide</h1>
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
        ]}
      />
    </section>
  );
}
