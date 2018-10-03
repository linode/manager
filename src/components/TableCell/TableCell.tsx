import * as classNames from 'classnames';
import * as React from 'react';

import Hidden from '@material-ui/core/Hidden';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableCell, { TableCellProps } from '@material-ui/core/TableCell';

type ClassNames = 'root'
  | 'emptyCell'
  | 'noWrap'
  | 'sortable'
  | 'data';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  emptyCell: {
    [theme.breakpoints.down('sm')]: {
      display: 'none !important'
    },
  },
  noWrap: {
    whiteSpace: 'nowrap',
  },
  sortable: {
    color: theme.color.headline,
    fontWeight: 'normal',
    cursor: 'pointer',
    '& button, & button:focus': {
      color: theme.color.headline,
      fontWeight: 'normal',
      fontSize: '.9rem',
    },
    '& .sortIcon': {
      position: 'relative',
      top: 2,
      left: 10,
      color: theme.palette.primary.main,
    },
  },
  data: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'right',
      marginLeft: theme.spacing.unit * 3,
    },
  },
});

export interface Props extends TableCellProps {
  noWrap?: boolean;
  sortable?: boolean;
  className?: string;
  /*
   * parent column will either be the name of the column this
   * TableCell is listed under 
   */
  parentColumn?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class WrappedTableCell extends React.Component<CombinedProps> {

  render() {
    const { classes, className, parentColumn, noWrap, sortable, ...rest } = this.props;

    return (
      <TableCell
        className={classNames(
          className,
          {
            [classes.root]: true,
            [classes.noWrap]: noWrap,
            [classes.sortable]: sortable,
            // hide the cell at small breakpoints if it's empty with no parent column 
            [classes.emptyCell]: !parentColumn && !this.props.children
          })}
        {...rest}
      >
        {(!!parentColumn)
          ? <React.Fragment>
            <Hidden mdUp>
              <span>{parentColumn}</span>
            </Hidden>
            <span className={classes.data}>{this.props.children}</span>
          </React.Fragment>
          : this.props.children
        }
      </TableCell>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WrappedTableCell);
