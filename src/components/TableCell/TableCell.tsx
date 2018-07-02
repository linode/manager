import * as React from 'react';

import * as classNames from 'classnames';

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
    color: theme.palette.text.primary,
    fontWeight: 'normal',
    cursor: 'pointer',
    '& button': {
      color: theme.palette.text.primary,
      fontWeight: 'normal',
      fontSize: '.9rem',
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
