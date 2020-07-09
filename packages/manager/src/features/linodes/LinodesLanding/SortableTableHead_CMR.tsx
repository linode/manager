import * as React from 'react';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import Hidden from 'src/components/core/Hidden';

type CombinedProps = Omit<OrderByProps, 'data'>;

const SortableTableHead: React.FC<CombinedProps> = props => {
  const { handleOrderChange, order, orderBy } = props;

  const isActive = (label: string) =>
    label.toLowerCase() === orderBy.toLowerCase();

  return (
    <TableHead role="rowgroup" data-qa-table-head>
      <TableRow>
        <TableSortCell
          label="label"
          direction={order}
          active={isActive('label')}
          handleClick={handleOrderChange}
          data-qa-sort-label={order}
        >
          Label
        </TableSortCell>
        <TableSortCell
          noWrap
          label="displayStatus"
          direction={order}
          active={isActive('displayStatus')}
          handleClick={handleOrderChange}
        >
          Status
        </TableSortCell>
        <TableSortCell
          label="ipv4[0]" // we want to sort by the first ipv4
          active={isActive('ipv4[0]')}
          handleClick={handleOrderChange}
          direction={order}
        >
          IP Address
        </TableSortCell>
        <TableSortCell
          label="region"
          direction={order}
          active={isActive('region')}
          handleClick={handleOrderChange}
          data-qa-sort-region={order}
        >
          Region
        </TableSortCell>
        <TableSortCell
          noWrap
          label="backups:last_successful"
          direction={order}
          active={isActive('backups:last_successful')}
          handleClick={handleOrderChange}
        >
          Last Backup
        </TableSortCell>
        <Hidden mdDown>
          <TableCell style={{ borderRight: 'none' }}>Tags</TableCell>
        </Hidden>
        <TableCell style={{ borderLeft: 'none' }} />
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
