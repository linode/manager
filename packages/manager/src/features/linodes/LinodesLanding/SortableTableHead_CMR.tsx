import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  labelWrapper: {
    [theme.breakpoints.between('xs', 'sm')]: {
      backgroundColor: theme.bg.tableHeader,
      position: 'sticky',
      left: 0,
      zIndex: 1
    }
  },
  statusWrapper: {
    [theme.breakpoints.between('xs', 'sm')]: {
      backgroundColor: theme.bg.tableHeader,
      position: 'sticky',
      left: 218,
      zIndex: 1
    }
  },
  actionWrapper: {
    [theme.breakpoints.between('xs', 'sm')]: {
      backgroundColor: theme.bg.tableHeader,
      position: 'sticky',
      right: 0,
      zIndex: 1
    }
  }
}));

type CombinedProps = Omit<OrderByProps, 'data'>;

const SortableTableHead: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { handleOrderChange, order, orderBy } = props;

  const isActive = (label: string) =>
    label.toLowerCase() === orderBy.toLowerCase();

  return (
    <TableHead role="rowgroup" data-qa-table-head>
      <TableRow>
        <TableSortCell
          className={classes.labelWrapper}
          label="label"
          direction={order}
          active={isActive('label')}
          handleClick={handleOrderChange}
          data-qa-sort-label={order}
        >
          Label
        </TableSortCell>
        <TableSortCell
          className={classes.statusWrapper}
          noWrap
          label="_statusPriority"
          direction={order}
          active={isActive('_statusPriority')}
          handleClick={handleOrderChange}
        >
          Status
        </TableSortCell>
        <Hidden xsDown>
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
        </Hidden>
        <Hidden mdDown>
          <TableCell>Tags</TableCell>
        </Hidden>
        <TableCell className={classes.actionWrapper} />
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHead;
