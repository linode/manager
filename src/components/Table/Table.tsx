import * as React from 'react';

import { withStyles, WithStyles, StyleRulesCallback, Theme } from '@material-ui/core/styles';
import Table, { TableProps } from '@material-ui/core/Table';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    overflowX: 'auto',
    [theme.breakpoints.down('md')]: {
      '& thead': {
        display: 'none',
      },
      '& tr': {
        display: 'block',
        marginBottom: 20,
        height: 'auto',
      },
      '& td': {
        display: 'block',
        textAlign: 'right',
        '&:before': {
          content: '"TableHeader Value"',
          float: 'left',
          textTransform: 'uppercase',
          fontWeight: 700,
        },
      },
    },
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
