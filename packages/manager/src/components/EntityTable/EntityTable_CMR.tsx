import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import { OrderByProps } from 'src/components/OrderBy';
import APIPaginatedTable from './APIPaginatedTable';
import GroupedEntitiesByTag from './GroupedEntitiesByTag_CMR';
import ListEntities from './ListEntities_CMR';
import { EntityTableRow, PageyIntegrationProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  hiddenHeaderCell: theme.visually.hidden,
  root: {
    '& td': {
      borderTop: 0,
      paddingLeft: '15px',
      paddingRight: '15px'
    }
  },
  '& .MuiTableCell-head': {
    borderBottom: 0
  },
  thead: {
    '& p': {
      fontFamily: theme.font.bold,
      fontWeight: 500
    }
  }
}));

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

export type CombinedProps = Props & PageyIntegrationProps;

export const LandingTable: React.FC<CombinedProps> = props => {
  const { entity, headers, groupByTag, row, initialOrder } = props;
  const classes = useStyles();
  const tableProps = {
    data: row.data,
    request: row.request,
    error: row.error,
    loading: row.loading,
    lastUpdated: row.lastUpdated,
    RowComponent: row.Component,
    headers,
    initialOrder,
    entity,
    handlers: row.handlers
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

  if (groupByTag) {
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
export { EntityTableRow }; // @todo remove after CMR; consolidate types and exports in index.tsx
