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
import SortableTableHead_CMR from './SortableTableHead_CMR';

type ClassNames = 'root' | 'paperWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      '& th:first-child': {
        borderRight: '1px solid #f4f4f4'
      },
      '& th': {
        borderLeft: '1px solid #f4f4f4',
        paddingLeft: 15,
        paddingRight: 15
      }
    },
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
        <Grid item xs={12} className="py0">
          <Table
            className={classes.root}
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

const styled = withStyles(styles);

export default styled(TableWrapper);
