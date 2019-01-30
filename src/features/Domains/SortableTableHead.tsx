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

type ClassNames = 'root' | 'label';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  label: {
    paddingLeft: 65
  }
});

type combinedProps = Omit<OrderByProps, 'data'> & WithStyles<ClassNames>;

const SortableTableHead: React.StatelessComponent<combinedProps> = props => {
  const { order, orderBy, handleOrderChange, classes } = props;

  const isActive = (label: string) => label === orderBy;

  return (
    <TableHead data-qa-table-head={order}>
      <TableRow>
        <TableSortCell
          label="domain"
          direction={order}
          active={isActive('domain')}
          handleClick={handleOrderChange}
          data-qa-sort-domain={order}
          className={classes.label}
        >
          Domain
        </TableSortCell>
        <TableSortCell
          label="type"
          direction={order}
          active={isActive('type')}
          handleClick={handleOrderChange}
          data-qa-sort-type={order}
        >
          Type
        </TableSortCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

const styled = withStyles(styles);

export default styled(SortableTableHead);
