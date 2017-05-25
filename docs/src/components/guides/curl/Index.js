import React from 'react';

import { Breadcrumbs } from 'linode-components/breadcrumbs';
import { Table } from 'linode-components/tables';
import { LinkCell } from 'linode-components/tables/cells';

export default function Index() {
  return(
    <section className="Article">
      <h1>cURL Guide</h1>
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
            href: '/guides/curl/testing-with-curl',
            path: 'Testing with cURL',
            description: 'A crash course on cURL and how to use it to try out the API.',
          },
          {
            href: '/guides/curl/creating-a-linode',
            path: 'Creating a Linode',
            description: 'Starting from nothing and ending with a running server.',
          },
        ]}
      />
    </section>
  );
}
