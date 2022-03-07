import classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell, { TableCellProps } from 'src/components/core/TableCell';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderTop: 'none',
    borderBottom: `1px solid ${theme.borderColors.borderTable}`,
    color: theme.textColors.tableStatic,
    fontSize: '.875rem',
    lineHeight: '1rem',
    padding: '0px 15px',
    '&.emptyCell': {
      height: 40,
    },
    '&:last-child': {
      paddingRight: 0,
    },
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
  center: {
    textAlign: 'center',
    '&:last-child': {
      paddingRight: '15px',
    },
  },
  sortable: {
    color: theme.color.headline,
    fontWeight: 'normal',
    cursor: 'pointer',
    '& button, & button:focus': {
      color: theme.color.headline,
      fontWeight: 'normal',
    },
    '& .sortIcon': {
      position: 'relative',
      top: 2,
      left: 10,
      color: theme.palette.primary.main,
    },
  },
  compact: {
    padding: 6,
  },
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 40,
    padding: 0,
    // Prevents Safari from adding margins to the ActionMenu button
    '& > button': {
      margin: 0,
    },
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
}));

export interface Props extends TableCellProps {
  noWrap?: boolean;
  sortable?: boolean;
  className?: string;
  /*
   * parent column will either be the name of the column this
   * TableCell is listed under
   */
  parentColumn?: string;
  compact?: boolean;
  actionCell?: boolean;
  statusCell?: boolean;
  center?: boolean;
}

type CombinedProps = Props;

export const WrappedTableCell: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    className,
    parentColumn,
    noWrap,
    sortable,
    compact,
    actionCell,
    statusCell,
    center,
    ...rest
  } = props;

  return (
    <TableCell
      className={classNames(className, {
        [classes.root]: true,
        [classes.noWrap]: noWrap,
        [classes.sortable]: sortable,
        [classes.compact]: compact,
        [classes.actionCell]: actionCell,
        [classes.center]: center,
        // hide the cell at small breakpoints if it's empty with no parent column
        emptyCell: !parentColumn && !props.children,
      })}
      {...rest}
    >
      {statusCell ? (
        <div className={classes.status}>{props.children}</div>
      ) : (
        props.children
      )}
    </TableCell>
  );
};

export default WrappedTableCell;
