import * as React from 'react';
import TableCell from 'src/components/core/TableCell';
import OrderBy from 'src/components/OrderBy';
import TableSortCell from 'src/components/TableSortCell';
import GroupedEntitiesByTag from './GroupedEntitiesByTag';
import ListEntities from './ListEntities';

interface Props {
  data: any[];
  entity: string;
  headers: HeaderCell[];
  groupByTag: boolean;
  RowComponent: React.ComponentType;
}

export type CombinedProps = Props;

export const LandingTable: React.FC<Props> = props => {
  const { data, entity, headers, groupByTag, RowComponent } = props;
  return (
    <OrderBy data={data} orderBy={'label'} order={'asc'}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => {
        const headerCells = headers.map((thisCell: HeaderCell) => {
          return thisCell.sortable ? (
            <TableSortCell
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
              data-testid={`${thisCell.label}-header-cell`}
              style={{ width: thisCell.widthPercent }}
            >
              {thisCell.label}
            </TableCell>
          );
        });

        const tableProps = {
          data,
          RowComponent,
          headerCells,
          entity
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
}

export default LandingTable;
