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

type ClassNames =
  | 'ip'
  | 'nameCell'
  | 'nodeStatus'
  | 'ports'
  | 'transferred'
  | 'region';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  nameCell: {
    width: '20%',
    minWidth: 150,
    paddingLeft: theme.spacing.unit * 2 + 49
  },
  nodeStatus: {
    width: '15%',
    minWidth: 100
  },
  transferred: {
    width: '15%',
    minWidth: 100
  },
  ports: {
    width: '15%',
    minWidth: 50
  },
  ip: {
    width: '15%',
    minWidth: 200
  },
  region: {
    width: '15%',
    minWidth: 150
  }
});

type CombinedProps = WithStyles<ClassNames> & Omit<OrderByProps, 'data'>;

const SortableTableHead: React.StatelessComponent<CombinedProps> = props => {
  const { classes, order, orderBy, handleOrderChange } = props;

  const isActive = (label: string) => label === orderBy;

  return (
    <TableHead data-qa-table-head={order}>
      <TableRow>
        <TableSortCell
          className={classes.nameCell}
          active={isActive('label')}
          label="label"
          direction={order}
          handleClick={handleOrderChange}
          data-qa-nb-label={order}
        >
          Name
        </TableSortCell>
        <TableCell className={classes.nodeStatus} noWrap>
          Node Status
        </TableCell>
        <TableCell className={classes.transferred}>Transferred</TableCell>
        <TableCell className={classes.ports}>Ports</TableCell>
        <TableCell className={classes.ip} noWrap>
          IP Address
        </TableCell>
        <TableSortCell
          className={classes.region}
          active={isActive('region')}
          label="region"
          direction={order}
          handleClick={handleOrderChange}
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
