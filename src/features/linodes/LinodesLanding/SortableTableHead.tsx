import * as React from 'react';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

const SortableTableHead: React.StatelessComponent<Omit<OrderByProps, 'data'>> = (props) => {
  const { order, orderBy, handleOrderChange } = props;

  const isActive = (label: string) => label.toLowerCase() === orderBy.toLowerCase();
  
  return (
    <TableHead data-qa-table-head>
      <TableRow>
        <TableSortCell
          label='label'
          direction={order}
          active={isActive('label')}
          handleClick={handleOrderChange}
          data-qa-sort-label={order}
        >
          Linode
        </TableSortCell>
        <TableSortCell
          label='tags'
          direction={order}
          active={isActive('tags')}
          handleClick={handleOrderChange}
        >
          Tags
        </TableSortCell>
        <TableSortCell
          noWrap
          label='mostRecentBackup'
          direction={order}
          active={isActive('mostRecentBackup')}
          handleClick={handleOrderChange}
        >
          Last Backup
        </TableSortCell>
        <TableCell>IP Addresses</TableCell>
        <TableSortCell
          label='region'
          direction={order}
          active={isActive('region')}
          handleClick={handleOrderChange}
          data-qa-sort-region={order}
        >
          Region
        </TableSortCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
