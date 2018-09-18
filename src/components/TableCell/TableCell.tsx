import * as classNames from 'classnames';
import * as React from 'react';

import Hidden from '@material-ui/core/Hidden';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableCell, { TableCellProps } from '@material-ui/core/TableCell';

type ClassNames = 'root'
  | 'noWrap'
  | 'sortable'
  | 'data';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {},
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
  /**
   * parent column will either be the name of the column this
   * TableCell is listed under or if this table cell is the 
   * in the table header, set to false to disregard
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
