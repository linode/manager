import * as classNames from 'classnames';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell, { TableCellProps } from 'src/components/core/TableCell';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderTop: 'none !important',
    borderBottom: `1px solid ${theme.cmrBorderColors.borderTable}`,
    color: theme.cmrTextColors.tableStatic,
    fontSize: '.875rem',
    lineHeight: '1rem',
    padding: '0px 15px',
    '&.emptyCell': {
      height: 40
    },
    '&:last-child': {
      paddingRight: 0
    }
  },
  noWrap: {
    whiteSpace: 'nowrap'
  },
  sortable: {
    color: theme.color.headline,
    fontWeight: 'normal',
    cursor: 'pointer',
    '& button, & button:focus': {
      color: theme.color.headline,
      fontWeight: 'normal'
    },
    '& .sortIcon': {
      position: 'relative',
      top: 2,
      left: 10,
      color: theme.palette.primary.main
    }
  },
  compact: {
    padding: 6
  }
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
}

type CombinedProps = Props;

export const WrappedTableCell: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { className, parentColumn, noWrap, sortable, compact, ...rest } = props;

  return (
    <TableCell
      className={classNames(className, {
        [classes.root]: true,
        [classes.noWrap]: noWrap,
        [classes.sortable]: sortable,
        [classes.compact]: compact,
        // hide the cell at small breakpoints if it's empty with no parent column
        emptyCell: !parentColumn && !props.children
      })}
      {...rest}
    >
      {props.children}
    </TableCell>
  );
};

export default WrappedTableCell;
