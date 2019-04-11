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
  | 'tags'
  | 'ports'
  | 'tagGroup'
  | 'title'
  | 'transferred'
  | 'region';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  ip: {
    width: '30%',
    minWidth: 200
  },
  nameCell: {
    width: '15%',
    minWidth: 150,
    paddingLeft: theme.spacing.unit * 2 + 49
  },
  region: {
    width: '15%',
    minWidth: 150
  },
  tags: {
    width: '10%',
    minWidth: 100,
    textAlign: 'center'
  },
  nodeStatus: {
    width: '10%',
    minWidth: 100
  },
  ports: {
    width: '10%',
    minWidth: 50
  },
  tagGroup: {
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing.unit - 2
  },
  title: {
    marginBottom: theme.spacing.unit * 2
  },
  transferred: {
    width: '10%',
    minWidth: 100
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
        <TableCell className={classes.tags} noWrap>
          Tags
        </TableCell>
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
