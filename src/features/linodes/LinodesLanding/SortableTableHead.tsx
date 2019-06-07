import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

type ClassNames = 'root' | 'label' | 'tagHeader';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  label: {
    paddingLeft: theme.spacing.unit * 2 + 49
  },
  tagHeader: {
    textAlign: 'center'
  }
});

interface Props {
  someLinodesHaveMaintenance: boolean;
}

type combinedProps = Omit<OrderByProps, 'data'> &
  WithStyles<ClassNames> &
  Props;

const SortableTableHead: React.StatelessComponent<combinedProps> = props => {
  const { order, orderBy, handleOrderChange, classes } = props;

  const isActive = (label: string) =>
    label.toLowerCase() === orderBy.toLowerCase();

  return (
    <TableHead data-qa-table-head>
      <TableRow>
        <TableSortCell
          label="label"
          direction={order}
          active={isActive('label')}
          handleClick={handleOrderChange}
          data-qa-sort-label={order}
          className={classes.label}
        >
          Linode
        </TableSortCell>
        <TableSortCell
          noWrap
          label="mostRecentBackup"
          direction={order}
          active={isActive('mostRecentBackup')}
          handleClick={handleOrderChange}
        >
          Last Backup
        </TableSortCell>
        <TableSortCell
          label="ipv4[0]" // we want to sort by the first ipv4
          active={isActive('ipv4[0]')}
          handleClick={handleOrderChange}
          direction={order}
        >
          IP Address
        </TableSortCell>
        {props.someLinodesHaveMaintenance && (
          <TableSortCell
            label="maintenance:when"
            active={isActive('maintenance:when')}
            handleClick={handleOrderChange}
            direction={order}
          >
            Maintenance Status
          </TableSortCell>
        )}
        <TableSortCell
          label="region"
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

const styled = withStyles(styles);

export default styled(SortableTableHead);
