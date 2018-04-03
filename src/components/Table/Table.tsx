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
  },
});

type CombinedProps = TableProps & WithStyles<ClassNames>;

class WrappedTable extends React.Component<CombinedProps> {

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Table {...this.props}>{this.props.children}</Table>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WrappedTable);


