import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';

type ClassNames = 'root' | 'label';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  label: {
    paddingLeft: 65
  }
});

type combinedProps = Omit<OrderByProps, 'data'> & WithStyles<ClassNames>;

const SortableTableHead: React.StatelessComponent<combinedProps> = (props) => {
  const { order, orderBy, handleOrderChange, classes } = props;

  const isActive = (label: string) => label === orderBy;

  return (
    <TableHead data-qa-table-head>
      <TableRow>
        <TableSortCell
          label='label'
          direction={order}
          active={isActive('label')}
          handleClick={handleOrderChange}
          data-qa-sort-label={order}
          className={classes.label}
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
        <TableCell noWrap>Last Backup</TableCell>
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

const styled = withStyles(styles);

export default styled(SortableTableHead);
