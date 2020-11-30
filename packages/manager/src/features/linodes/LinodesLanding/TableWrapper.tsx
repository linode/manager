import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Table from 'src/components/Table';
import SortableTableHead from './SortableTableHead';

type ClassNames = 'root' | 'paperWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    paperWrapper: {
      backgroundColor: 'transparent'
    }
  });

interface Props {
  dataLength: number;
}

type CombinedProps = Omit<OrderByProps, 'data'> &
  WithStyles<ClassNames> &
  Props;

const TableWrapper: React.FC<CombinedProps> = props => {
  const { order, orderBy, handleOrderChange, dataLength, classes } = props;

  return (
    <Paper className={classes.paperWrapper}>
      <Grid container className="my0">
        <Grid item xs={12}>
          <Table
            aria-label="List of Linodes"
            rowCount={dataLength}
            colCount={5}
          >
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

export default styled(TableWrapper);
