import * as React from 'react';
import { OrderByProps } from 'src/components/OrderBy';
import APIPaginatedTable from './APIPaginatedTable';
import GroupedEntitiesByTag from './GroupedEntitiesByTag';
import ListEntities from './ListEntities';
import { BaseProps } from './types';

export interface EntityTableRow<T> extends BaseProps {
  Component: React.ComponentType<any>;
  data: T[];
  request?: () => Promise<any>;
}

interface Props {
  entity: string;
  headers: HeaderCell[];
  groupByTag: boolean;
  row: EntityTableRow<any>;
  initialOrder?: {
    order: OrderByProps['order'];
    orderBy: OrderByProps['orderBy'];
  };
}

export type CombinedProps = Props;

export const LandingTable: React.FC<Props> = props => {
  const { entity, headers, groupByTag, row, initialOrder } = props;
  const tableProps = {
    data: row.data,
    request: row.request,
    RowComponent: row.Component,
    initialOrder,
    headers,
    entity,
    handlers: row.handlers,
    loading: row.loading,
    lastUpdated: row.lastUpdated
  };

  if (row.request) {
    return <APIPaginatedTable {...tableProps} data={undefined} />;
  }

  if (groupByTag) {
    return <GroupedEntitiesByTag {...tableProps} />;
  }

  if (row.request) {
    return <APIPaginatedTable {...tableProps} data={undefined} />;
  }
  return <ListEntities {...tableProps} />;
};

export interface HeaderCell {
  sortable: boolean;
  label: string;
  dataColumn: string;
  widthPercent: number;
  visuallyHidden?: boolean;
}

export default LandingTable;
