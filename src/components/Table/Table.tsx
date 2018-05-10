import * as React from 'react';

import {
  withStyles,
  WithStyles,
  StyleRulesCallback,
  Theme,
} from 'material-ui';
import Table, { TableProps } from 'material-ui/Table';

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
}

type CombinedProps = Props & TableProps & WithStyles<ClassNames>;

class WrappedTable extends React.Component<CombinedProps> {

  render() {
    const { classes, className, ...rest } = this.props;

    return (
      <div className={`${classes.root} ${className}`}>
        <Table {...rest}>{this.props.children}</Table>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WrappedTable);

