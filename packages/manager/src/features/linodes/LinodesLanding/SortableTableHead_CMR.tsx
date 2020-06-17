import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableSortCell from 'src/components/TableSortCell';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  label: {
    paddingLeft: theme.spacing(2) + 49
  },
  tagHeader: {
    textAlign: 'center'
  }
}));

type CombinedProps = Omit<OrderByProps, 'data'>;

const SortableTableHead: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { order, orderBy, handleOrderChange } = props;

  const isActive = (label: string) =>
    label.toLowerCase() === orderBy.toLowerCase();

  return (
    <TableHead data-qa-table-head role="rowgroup">
      <TableRow>
        <TableSortCell
          label="label"
          direction={order}
          active={isActive('label')}
          handleClick={handleOrderChange}
          data-qa-sort-label={order}
          className={classes.label}
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
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
