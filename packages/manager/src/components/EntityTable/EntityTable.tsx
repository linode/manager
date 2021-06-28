import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import { OrderByProps } from 'src/components/OrderBy';
import APIPaginatedTable from './APIPaginatedTable';
import GroupedEntitiesByTag from './GroupedEntitiesByTag';
import ListEntities from './ListEntities';
import type { BaseProps, PageyIntegrationProps } from './types';

const useStyles = makeStyles(() => ({
  root: {
    '& td': {
      borderTop: 0,
      paddingLeft: '15px',
      paddingRight: '15px',
    },
  },
}));

export interface EntityTableRow<T> extends BaseProps {
  Component: React.ComponentType<any>;
  data: T[];
  request?: () => Promise<any>;
}

interface Props {
  entity: string;
  headers: HeaderCell[];
  row: EntityTableRow<any>;
  emptyMessage?: string;
  initialOrder?: {
    order: OrderByProps['order'];
    orderBy: OrderByProps['orderBy'];
  };
  toggleGroupByTag?: () => boolean;
  isGroupedByTag?: boolean;
  isLargeAccount?: boolean;
}

export type CombinedProps = Props & PageyIntegrationProps;

export const LandingTable: React.FC<CombinedProps> = (props) => {
  const {
    entity,
    headers,
    row,
    emptyMessage,
    initialOrder,
    toggleGroupByTag,
    isGroupedByTag,
    isLargeAccount,
  } = props;
  const classes = useStyles();
  const tableProps = {
    data: row.data,
    request: row.request,
    error: row.error,
    loading: row.loading,
    lastUpdated: row.lastUpdated,
    entity,
    headers,
    RowComponent: row.Component,
    handlers: row.handlers,
    emptyMessage,
    initialOrder,
    toggleGroupByTag,
    isGroupedByTag,
    isLargeAccount,
  };

  if (row.request) {
    return (
      <APIPaginatedTable
        {...tableProps}
        persistData={props.persistData}
        normalizeData={props.normalizeData}
        data={undefined}
      />
    );
  }

  if (isGroupedByTag) {
    return (
      <div className={classes.root}>
        <GroupedEntitiesByTag {...tableProps} />
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <ListEntities {...tableProps} />
    </div>
  );
};

export interface HeaderCell {
  sortable: boolean;
  label: string;
  dataColumn: string;
  widthPercent: number;
  visuallyHidden?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

export default LandingTable;
