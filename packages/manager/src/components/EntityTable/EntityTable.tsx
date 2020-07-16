import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import OrderBy, { OrderByProps } from 'src/components/OrderBy';
import TableSortCell from 'src/components/TableSortCell';
import APIPaginatedTable from './APIPaginatedTable';
import GroupedEntitiesByTag from './GroupedEntitiesByTag';
import ListEntities from './ListEntities';
import { BaseProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  hiddenHeaderCell: theme.visually.hidden
}));

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
          request: row.request,
          RowComponent: row.Component,
          headerCells,
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
