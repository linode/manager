import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Table, { TableProps } from '@material-ui/core/Table';

type ClassNames = 'root'
  | 'border';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    overflowX: 'auto',
  },
  border: {
    border: `1px solid ${theme.palette.divider}`,
    borderBottom: 0,
  },
});

interface Props {
  className?: string;
  noOverflow?: boolean;
  tableClass?: string;
  border?: boolean;
}

type CombinedProps = Props & TableProps & WithStyles<ClassNames>;

class WrappedTable extends React.Component<CombinedProps> {

  render() {
    const { classes, className, tableClass, border, noOverflow, ...rest } = this.props;

    const tableWrapperClasses = 
      (noOverflow) ? className : `${classes.root} ${className}`;

    return (
      <div className={`${tableWrapperClasses} ${border && classes.border}`}>
        <Table className={tableClass} {...rest}>{this.props.children}</Table>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WrappedTable);
