import { Domain } from '@linode/api-v4/lib/domains/types';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Grid from 'src/components/Grid';
import EntityTable, { EntityTableRow, HeaderCell } from './EntityTable';
import { Provider } from 'react-redux';
import store from 'src/store';

import { domainFactory } from 'src/factories/domain';
import DomainRow from 'src/features/Domains/DomainTableRow';

const domains1 = domainFactory.buildList(10, { tags: ['tag1'] });
const domains2 = domainFactory.buildList(10, { tags: ['tag2'] });
const domains = [...domains1, ...domains2];

const headers: HeaderCell[] = [
  {
    label: 'Domain',
    dataColumn: 'domain',
    sortable: true,
    widthPercent: 25,
  },
  {
    label: 'Type',
    dataColumn: 'type',
    sortable: true,
    widthPercent: 15,
  },
  {
    label: 'Status',
    dataColumn: 'status',
    sortable: false,
    widthPercent: 25,
  },
  {
    label: 'Last Modified',
    dataColumn: 'updated',
    sortable: true,
    widthPercent: 25,
  },
  {
    label: 'Action Menu',
    visuallyHidden: true,
    dataColumn: '',
    sortable: false,
    widthPercent: 5,
  },
];

const domainRow: EntityTableRow<Domain> = {
  Component: DomainRow as any,
  data: domains,
  loading: false,
  lastUpdated: 100,
};

storiesOf('EntityTable', module)
  .add('list view', () => (
    <Provider store={store}>
      <Grid spacing={8}>
        <EntityTable
          entity="domains"
          headers={headers}
          row={domainRow}
          groupByTag={false}
        />
      </Grid>
    </Provider>
  ))
  .add('grouped by tag', () => (
    <Provider store={store}>
      <Grid spacing={8}>
        <EntityTable
          entity="domains"
          headers={headers}
          row={domainRow}
          groupByTag={true}
        />
      </Grid>
    </Provider>
  ));
