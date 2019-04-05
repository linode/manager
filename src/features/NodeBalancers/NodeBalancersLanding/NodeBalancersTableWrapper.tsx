import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Table from 'src/components/Table';
import SortableTableHead from './SortableTableHead';

type ClassNames = 'root' | 'paperWrapper';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  paperWrapper: {
    backgroundColor: 'transparent'
  }
});

type CombinedProps = Omit<OrderByProps, 'data'> & WithStyles<ClassNames>;

const NodeBalancersTableWrapper: React.StatelessComponent<
  CombinedProps
> = props => {
  const { order, orderBy, handleOrderChange, classes } = props;

  return (
    <Paper className={classes.paperWrapper}>
      <Grid container className="my0">
        <Grid item xs={12} className="py0">
          <Table removeLabelonMobile aria-label="List of NodeBalancers">
            <SortableTableHead
              order={order}
              orderBy={orderBy}
              handleOrderChange={handleOrderChange}
            />
            {props.children}
          </Table>
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(NodeBalancersTableWrapper);
