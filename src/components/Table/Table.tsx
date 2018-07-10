import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Table, { TableProps } from '@material-ui/core/Table';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    overflowX: 'auto',
  },
});

interface Props {
  className?: string;
  noOverflow?: boolean;
  tableClass?: string;
}

type CombinedProps = Props & TableProps & WithStyles<ClassNames>;

class WrappedTable extends React.Component<CombinedProps> {

  render() {
    const { classes, className, tableClass, noOverflow, ...rest } = this.props;

    const tableWrapperClasses = (noOverflow) ? className : `${classes.root} ${className}`;

    return (
      <div className={tableWrapperClasses}>
        <Table className={tableClass} {...rest}>{this.props.children}</Table>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WrappedTable);
