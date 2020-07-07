import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Table from 'src/components/Table';
import SortableTableHead_CMR from './SortableTableHead_CMR';

const useStyles = makeStyles(() => ({
  paperWrapper: {
    backgroundColor: 'transparent'
  }
}));

interface Props {
  dataLength: number;
}

type CombinedProps = Omit<OrderByProps, 'data'> & Props;

const TableWrapper: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { dataLength, order, orderBy, handleOrderChange } = props;

  return (
    <Paper className={classes.paperWrapper}>
      <Grid container className="my0">
        <Grid item xs={12} className="p0">
          <Table
            aria-label="List of Linodes"
            rowCount={dataLength}
            colCount={5}
          >
            <SortableTableHead_CMR
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

export default TableWrapper;
