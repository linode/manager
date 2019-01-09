import * as React from 'react';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

const SortableTableHead: React.StatelessComponent<Omit<OrderByProps, 'data'>> = (props) => {
  const { order, orderBy, handleOrderChange } = props;

  const isActive = (label: string) => label === orderBy;

  return (
    <TableHead data-qa-table-head={order}>
      <TableRow>
        <TableSortCell label='domain' direction={order} active={isActive('domain')} handleClick={handleOrderChange} data-qa-sort-domain={order}>Domain</TableSortCell>
        <TableSortCell label='type' direction={order} active={isActive('type')} handleClick={handleOrderChange} data-qa-sort-type={order}>Type</TableSortCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
