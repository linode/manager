import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Table from 'src/components/Table';
import SortableTableHead from './SortableTableHead';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

type CombinedProps = Omit<OrderByProps, 'data'> & WithStyles<ClassNames>;

const DomainsTableWrapper: React.StatelessComponent<CombinedProps> = (props) => {
  const { order, orderBy, handleOrderChange } = props;

  return (
    <Paper>
      <Grid container className="my0">
        <Grid item xs={12} className="py0">
          <Table arial-label="List of Linodes">
            <SortableTableHead order={order} orderBy={orderBy} handleOrderChange={handleOrderChange} />
            {props.children}
          </Table>
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(DomainsTableWrapper);
