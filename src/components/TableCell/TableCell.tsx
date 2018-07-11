import * as classNames from 'classnames';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableCell, { TableCellProps } from '@material-ui/core/TableCell';

type ClassNames = 'root'
  | 'noWrap'
  | 'sortable';

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
});

interface Props {
  noWrap?: boolean;
  sortable?: boolean;
  className?: string;
}

type CombinedProps = Props & TableCellProps & WithStyles<ClassNames>;

class WrappedTableCell extends React.Component<CombinedProps> {

  render() {
    const { classes, className, noWrap, sortable, ...rest } = this.props;

    return (
        <TableCell
          className={classNames(
          className,
            {
              [classes.root]: true,
              [classes.noWrap]: noWrap,
              [classes.sortable]: sortable,
            })}
          {...rest
        }>
          {this.props.children}
        </TableCell>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WrappedTableCell);
