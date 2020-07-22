import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import Typography from 'src/components/core/Typography';
import OrderBy, { OrderByProps } from 'src/components/OrderBy';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import GroupedEntitiesByTag from './GroupedEntitiesByTag_CMR';
import ListEntities from './ListEntities_CMR';
import { EntityTableRow } from './types';

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

export type CombinedProps = Props;

export const LandingTable: React.FC<Props> = props => {
  const { entity, headers, groupByTag, row, initialOrder } = props;
  const classes = useStyles();
  return (
    <OrderBy
      data={row.data}
      orderBy={initialOrder?.orderBy}
      order={initialOrder?.order}
    >
      {({ data: orderedData, handleOrderChange, order, orderBy }) => {
        const headerCells = headers.map((thisCell: HeaderCell) => {
          return thisCell.sortable ? (
            <TableSortCell
              key={thisCell.dataColumn}
              active={orderBy === thisCell.dataColumn}
              label={thisCell.dataColumn}
              direction={order}
              handleClick={handleOrderChange}
              style={{ width: thisCell.widthPercent }}
              data-testid={`${thisCell.label}-header-cell`}
            >
              {thisCell.label}
            </TableSortCell>
          ) : (
            <TableCell
              key={thisCell.dataColumn}
              data-testid={`${thisCell.label}-header-cell`}
              className={classes.thead}
              style={{ width: thisCell.widthPercent }}
            >
              <Typography
                className={
                  thisCell.visuallyHidden ? classes.hiddenHeaderCell : undefined
                }
              >
                {thisCell.label}
              </Typography>
            </TableCell>
          );
        });

        const tableProps = {
          data: orderedData,
          error: row.error,
          loading: row.loading,
          lastUpdated: row.lastUpdated,
          RowComponent: row.Component,
          headerCells,
          entity,
          handlers: row.handlers
        };

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
      }}
    </OrderBy>
  );
};

export interface HeaderCell {
  sortable: boolean;
  label: string;
  dataColumn: string;
  widthPercent: number;
  visuallyHidden?: boolean;
}

export default LandingTable;
export { EntityTableRow }; // @todo remove after CMR; consolidate types and exports in index.tsx
