import * as classNames from 'classnames';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableCell, { TableCellProps } from 'src/components/core/TableCell';

type ClassNames = 'root' | 'noWrap' | 'sortable' | 'data' | 'compact';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
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
      wordBreak: 'break-all',
      marginLeft: theme.spacing.unit * 3
    }
  },
  compact: {
    padding: 6
  }
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
  compact?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class WrappedTableCell extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      className,
      parentColumn,
      noWrap,
      sortable,
      compact,
      ...rest
    } = this.props;

    return (
      <TableCell
        className={classNames(className, {
          [classes.root]: true,
          [classes.noWrap]: noWrap,
          [classes.sortable]: sortable,
          [classes.compact]: compact,
          // hide the cell at small breakpoints if it's empty with no parent column
          emptyCell: !parentColumn && !this.props.children
        })}
        {...rest}
      >
        {!!parentColumn ? (
          <React.Fragment>
            <Hidden mdUp>
              <span>{parentColumn}</span>
            </Hidden>
            <span className={`${classes.data} data`}>
              {this.props.children}
            </span>
          </React.Fragment>
        ) : (
          this.props.children
        )}
      </TableCell>
    );
  }
}

export default withStyles(styles)(WrappedTableCell);
