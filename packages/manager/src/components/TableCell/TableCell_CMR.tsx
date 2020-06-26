import * as classNames from 'classnames';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell, { TableCellProps } from 'src/components/core/TableCell';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderTop: 'none',
    fontSize: '.875rem',
    lineHeight: '1rem',
    padding: '10px 15px'
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
      fontWeight: 'normal',
      fontSize: '.9rem'
    },
    '& .sortIcon': {
      position: 'relative',
      top: 2,
      left: 10,
      color: theme.palette.primary.main
    }
  },
  data: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'right',
      marginLeft: theme.spacing(3)
    },
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  },
  parentColSpan: {
    width: '100%'
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
      {!!parentColumn ? (
        <React.Fragment>
          <Hidden mdUp>
            <span className={classes.parentColSpan}>{parentColumn}</span>
          </Hidden>
          <div className={`${classes.data} data`}>{props.children}</div>
        </React.Fragment>
      ) : (
        props.children
      )}
    </TableCell>
  );
};

export default WrappedTableCell;
