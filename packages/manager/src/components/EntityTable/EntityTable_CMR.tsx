import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import Typography from 'src/components/core/Typography';
import OrderBy, { OrderByProps } from 'src/components/OrderBy';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import GroupedEntitiesByTag from './GroupedEntitiesByTag_CMR';
import ListEntities from './ListEntities_CMR';
import { Handlers } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  hiddenHeaderCell: theme.visually.hidden
}));

export interface EntityTableRow<T> {
  Component: React.ComponentType;
  data: T[];
  handlers?: Handlers;
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
          RowComponent: row.Component,
          headerCells,
          entity,
          handlers: row.handlers
        };

        if (groupByTag) {
          return <GroupedEntitiesByTag {...tableProps} />;
        }
        return <ListEntities {...tableProps} />;
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
